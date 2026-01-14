import type { StepContext, StepHandler } from '@ez4/stateful';
import type { LinkedVariables } from '@ez4/project/library';
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

type FunctionConfigurationWithVariables = FunctionParameters & {
  variables: LinkedVariables;
};

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
      variables: protectVariables(await target.getFunctionVariables()),
      sourceHash: await getBundleHash(...target.getFunctionFiles()),
      valuesHash: target.getFunctionHash()
    },
    {
      ...source,
      connections: current.connections,
      dependencies: current.dependencies,
      variables: current.result?.variables,
      sourceHash: current.result?.sourceHash,
      valuesHash: current.result?.valuesHash
    },
    {
      exclude: {
        release: true
      }
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
  const { functionName, release, ...parameters } = candidate.parameters;

  const logGroup = getLogGroupName(FunctionServiceName, functionName, context);
  const roleArn = getRoleArn(FunctionServiceName, functionName, context);

  const [sourceHash, sourceFile, valuesHash, variables] = await Promise.all([
    getBundleHash(...parameters.getFunctionFiles()),
    parameters.getFunctionBundle(context),
    parameters.getFunctionHash(),
    parameters.getFunctionVariables()
  ]);

  const importedFunction = await importFunction(functionName);
  const bundleHash = await hashFile(sourceFile);

  if (importedFunction) {
    await updateSourceCode(functionName, {
      architecture: parameters.architecture,
      publish: false,
      sourceFile
    });

    await updateConfiguration(functionName, {
      ...parameters,
      logGroup,
      roleArn,
      variables: {
        ...variables,
        ...(release?.variableName && {
          [release.variableName]: release.version
        })
      }
    });

    await tagFunction(importedFunction.functionArn, {
      ...parameters.tags,
      ...(release?.tagName && {
        [release.tagName]: release.version
      })
    });

    return {
      functionArn: importedFunction.functionArn,
      functionVersion: importedFunction.functionVersion,
      variables: protectVariables(variables),
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
    functionName,
    sourceFile,
    variables,
    logGroup,
    roleArn
  });

  return {
    functionArn: createdFunction.functionArn,
    functionVersion: createdFunction.functionVersion,
    variables: protectVariables(variables),
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

  const { functionName } = parameters;

  const newVariables = await parameters.getFunctionVariables();
  const oldVariables = current.result?.variables ?? newVariables;

  const newRoleArn = getRoleArn(FunctionServiceName, functionName, context);
  const oldRoleArn = current.result?.roleArn ?? newRoleArn;

  const newLogGroup = getLogGroupName(FunctionServiceName, functionName, context);
  const oldLogGroup = current.result?.logGroup ?? newLogGroup;

  const { isUpdated, ...newResult } = await checkSourceCodeUpdates(functionName, parameters, current.result, context);

  const newConfig = { ...parameters, variables: newVariables, roleArn: newRoleArn, logGroup: newLogGroup };
  const oldConfig = { ...current.parameters, variables: oldVariables, roleArn: oldRoleArn, logGroup: oldLogGroup };

  await checkConfigurationUpdates(functionName, newConfig, oldConfig, isUpdated, context);
  await checkTagUpdates(result.functionArn, parameters, current.parameters, isUpdated);

  return {
    ...result,
    ...newResult,
    variables: protectVariables(newVariables),
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

const checkConfigurationUpdates = async (
  functionName: string,
  candidate: FunctionConfigurationWithVariables,
  current: FunctionConfigurationWithVariables,
  isUpdated: boolean,
  context: StepContext
) => {
  const { variables, ...configuration } = candidate;

  const protectedCandidate = {
    variables: protectVariables(variables),
    ...configuration
  };

  const hasConfigurationChanges = !deepEqual(protectedCandidate, current, {
    exclude: {
      sourceFile: true,
      functionName: true,
      architecture: true,
      release: true,
      tags: true
    }
  });

  const candidateRelease = isUpdated ? candidate.release : current.release;
  const hasReleaseChange = isUpdated && candidateRelease?.variableName;

  if (hasConfigurationChanges || hasReleaseChange || context.force) {
    await updateConfiguration(functionName, {
      ...candidate,
      variables: {
        ...candidate.variables,
        ...(candidateRelease?.variableName && {
          [candidateRelease.variableName]: candidateRelease.version
        })
      }
    });
  }
};

const checkTagUpdates = async (functionArn: Arn, candidate: FunctionParameters, current: FunctionParameters, isUpdated: boolean) => {
  const candidateRelease = isUpdated ? candidate.release : current.release;

  const candidateTags = {
    ...candidate.tags,
    ...(candidateRelease?.tagName && {
      [candidateRelease.tagName]: candidateRelease.version
    })
  };

  await applyTagUpdates(
    candidateTags,
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

  if (newSourceHash !== oldSourceHash || newValuesHash !== oldValuesHash || context.force) {
    const newSourceFile = await candidate.getFunctionBundle(context);

    const newBundleHash = await hashFile(newSourceFile);
    const oldBundleHash = current?.bundleHash;

    if (newBundleHash === oldBundleHash && newValuesHash === oldValuesHash) {
      Logger.logSkip(FunctionServiceName, `${functionName} source code`);

      return {
        isUpdated: false,
        valuesHash: newValuesHash,
        sourceHash: newSourceHash
      };
    }

    const { functionVersion } = await updateSourceCode(functionName, {
      architecture: candidate.architecture,
      publish: !current?.functionVersion,
      sourceFile: newSourceFile
    });

    return {
      isUpdated: true,
      valuesHash: newValuesHash,
      sourceHash: newSourceHash,
      bundleHash: newBundleHash,
      ...(functionVersion && {
        functionVersion
      })
    };
  }

  return {
    isUpdated: false
  };
};
