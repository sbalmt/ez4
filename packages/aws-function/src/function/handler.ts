import type { StepContext, StepHandler } from '@ez4/stateful';
import type { Arn } from '@ez4/aws-common';
import type { FunctionState, FunctionResult, FunctionParameters } from './types.js';

import { applyTagUpdates, bundleHash, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';
import { getLogGroupName } from '@ez4/aws-logs';
import { getRoleArn } from '@ez4/aws-identity';

import {
  importFunction,
  createFunction,
  deleteFunction,
  updateConfiguration,
  updateSourceCode,
  tagFunction,
  untagFunction
} from './client.js';

import { protectVariables } from './helpers/variables.js';
import { FunctionServiceName } from './types.js';

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
      dependencies: candidate.dependencies,
      sourceHash: await bundleHash(target.sourceFile),
      ...(target.variables && {
        variables: protectVariables(target.variables)
      })
    },
    {
      ...source,
      dependencies: current.dependencies,
      sourceHash: current.result?.sourceHash
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

  const roleArn = getRoleArn(FunctionServiceName, functionName, context);
  const logGroup = getLogGroupName(FunctionServiceName, functionName, context);

  const [sourceFile, sourceHash] = await Promise.all([parameters.getFunctionBundle(context), bundleHash(parameters.sourceFile)]);

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
      sourceHash,
      logGroup,
      roleArn
    };
  }

  const response = await createFunction({
    ...parameters,
    publish: true,
    sourceFile,
    logGroup,
    roleArn
  });

  lockSensitiveData(candidate);

  return {
    functionArn: response.functionArn,
    sourceHash,
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
  const newSourceHash = await bundleHash(candidate.sourceFile);
  const oldSourceHash = current?.sourceHash;

  if (newSourceHash === oldSourceHash) {
    return current;
  }

  const sourceFile = await candidate.getFunctionBundle(context);

  const { functionVersion } = await updateSourceCode(functionName, {
    publish: !current?.functionVersion,
    sourceFile
  });

  return {
    sourceHash: newSourceHash,
    functionVersion
  };
};
