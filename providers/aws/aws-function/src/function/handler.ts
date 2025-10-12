import type { StepContext, StepHandler } from '@ez4/stateful';
import type { Arn } from '@ez4/aws-common';
import type { FunctionState, FunctionResult, FunctionParameters } from './types';

import { applyTagUpdates, getBundleHash, Logger, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual, hashFile } from '@ez4/utils';
import { getLogGroupName } from '@ez4/aws-logs';
import { getRoleArn } from '@ez4/aws-identity';

import {
  importFunction,
  createFunction,
  deleteFunction,
  updateConfiguration,
  updateSourceCode,
  untagFunction,
  tagFunction
} from './client';

import { protectVariables } from './helpers/variables';
import { FunctionServiceName } from './types';

export const getFunctionHandler = (): StepHandler<FunctionState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: FunctionState, current: FunctionState) => {
  return !!candidate.result && candidate.result.functionArn === current.result?.functionArn;
};

const previewResource = async (candidate: FunctionState, current: FunctionState) => {
  const target = candidate.parameters;
  const source = current.parameters;

  const changes = deepCompare(
    {
      ...target,
      connections: candidate.connections,
      dependencies: candidate.dependencies,
      variables: target.variables && protectVariables(target.variables),
      sourceHash: await getBundleHash(...target.getFunctionFiles()),
      valuesHash: target.getFunctionHash()
    },
    {
      ...source,
      connections: current.connections,
      dependencies: current.dependencies,
      sourceHash: current.result?.sourceHash,
      valuesHash: current.result?.valuesHash
    }
  );

  if (!changes.counts) {
    return undefined;
  }

  return {
    ...changes,
    name: target.functionName
  };
};

const replaceResource = async (candidate: FunctionState, current: FunctionState, context: StepContext) => {
  if (current.result) {
    throw new ReplaceResourceError(FunctionServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = async (candidate: FunctionState, context: StepContext): Promise<FunctionResult> => {
  const parameters = candidate.parameters;

  const functionName = parameters.functionName;

  const logGroup = getLogGroupName(FunctionServiceName, functionName, context);
  const roleArn = getRoleArn(FunctionServiceName, functionName, context);

  const [sourceHash, sourceFile, valuesHash] = await Promise.all([
    getBundleHash(...parameters.getFunctionFiles()),
    parameters.getFunctionBundle(context),
    parameters.getFunctionHash()
  ]);

  const bundleHash = await hashFile(sourceFile);

  const importedFunction = await importFunction(functionName);

  if (importedFunction) {
    await updateConfiguration(functionName, {
      ...parameters,
      logGroup,
      roleArn
    });

    await updateSourceCode(functionName, {
      publish: false,
      sourceFile
    });

    await tagFunction(importedFunction.functionArn, {
      ...parameters.tags
    });

    lockSensitiveData(candidate);

    return {
      functionArn: importedFunction.functionArn,
      functionVersion: importedFunction.functionVersion,
      valuesHash,
      sourceHash,
      bundleHash,
      logGroup,
      roleArn
    };
  }

  const createdFunction = await createFunction({
    ...parameters,
    publish: true,
    sourceFile,
    logGroup,
    roleArn
  });

  lockSensitiveData(candidate);

  return {
    functionArn: createdFunction.functionArn,
    functionVersion: createdFunction.functionVersion,
    valuesHash,
    sourceHash,
    bundleHash,
    logGroup,
    roleArn
  };
};

const updateResource = async (candidate: FunctionState, current: FunctionState, context: StepContext) => {
  const { parameters, result } = candidate;

  if (!result) {
    return;
  }

  const functionName = parameters.functionName;

  const newRoleArn = getRoleArn(FunctionServiceName, functionName, context);
  const oldRoleArn = current.result?.roleArn ?? newRoleArn;

  const newLogGroup = getLogGroupName(FunctionServiceName, functionName, context);
  const oldLogGroup = current.result?.logGroup ?? newLogGroup;

  const newConfig = { ...parameters, roleArn: newRoleArn, logGroup: newLogGroup };
  const oldConfig = { ...current.parameters, roleArn: oldRoleArn, logGroup: oldLogGroup };

  await checkConfigurationUpdates(functionName, newConfig, oldConfig);
  await checkTagUpdates(result.functionArn, parameters, current.parameters);

  const newResult = await checkSourceCodeUpdates(functionName, parameters, current.result, context);

  lockSensitiveData(candidate);

  return {
    ...result,
    ...newResult,
    logGroup: newLogGroup,
    roleArn: newRoleArn
  };
};

const deleteResource = async (candidate: FunctionState) => {
  const { result, parameters } = candidate;

  if (result) {
    await deleteFunction(parameters.functionName);
  }
};

const lockSensitiveData = (candidate: FunctionState) => {
  const { parameters } = candidate;

  if (parameters.variables) {
    parameters.variables = protectVariables(parameters.variables);
  }

  return candidate;
};

const checkConfigurationUpdates = async (functionName: string, candidate: FunctionParameters, current: FunctionParameters) => {
  const protectedCandidate = {
    ...candidate,
    ...(candidate.variables && {
      variables: protectVariables(candidate.variables)
    })
  };

  const hasChanges = !deepEqual(protectedCandidate, current, {
    exclude: {
      sourceFile: true,
      functionName: true,
      tags: true
    }
  });

  if (hasChanges) {
    await updateConfiguration(functionName, candidate);
  }
};

const checkTagUpdates = async (functionArn: Arn, candidate: FunctionParameters, current: FunctionParameters) => {
  await applyTagUpdates(
    candidate.tags,
    current.tags,
    (tags) => tagFunction(functionArn, tags),
    (tags) => untagFunction(functionArn, tags)
  );
};

const checkSourceCodeUpdates = async (
  functionName: string,
  candidate: FunctionParameters,
  current: FunctionResult | undefined,
  context: StepContext
) => {
  const [newSourceHash, newValuesHash] = await Promise.all([getBundleHash(...candidate.getFunctionFiles()), candidate.getFunctionHash()]);

  const oldSourceHash = current?.sourceHash;
  const oldValuesHash = current?.valuesHash;

  if (newSourceHash === oldSourceHash && newValuesHash === oldValuesHash && !context.force) {
    return current;
  }

  const sourceFile = await candidate.getFunctionBundle(context);

  const newBundleHash = await hashFile(sourceFile);
  const oldBundleHash = current?.bundleHash;

  if (newBundleHash === oldBundleHash) {
    Logger.logSkip(FunctionServiceName, `${functionName} source code`);
    return current;
  }

  const { functionVersion } = await updateSourceCode(functionName, {
    publish: !current?.functionVersion,
    sourceFile
  });

  return {
    valuesHash: newValuesHash,
    sourceHash: newSourceHash,
    bundleHash: newBundleHash,
    functionVersion
  };
};
