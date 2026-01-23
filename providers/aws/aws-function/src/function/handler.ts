import type { StepContext, StepHandler } from '@ez4/stateful';
import type { Arn, OperationLogLine } from '@ez4/aws-common';
import type { LinkedVariables } from '@ez4/project/library';
import type { FunctionState, FunctionResult, FunctionParameters } from './types';

import { applyTagUpdates, CorruptedResourceError, getBundleHash, OperationLogger, ReplaceResourceError } from '@ez4/aws-common';
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

const createResource = (candidate: FunctionState, context: StepContext): Promise<FunctionResult> => {
  const { functionName, release, ...parameters } = candidate.parameters;

  return OperationLogger.logExecution(FunctionServiceName, functionName, 'creation', async (logger) => {
    const logGroup = getLogGroupName(FunctionServiceName, functionName, context);
    const roleArn = getRoleArn(FunctionServiceName, functionName, context);

    const [sourceHash, sourceFile, valuesHash, variables] = await Promise.all([
      getBundleHash(...parameters.getFunctionFiles()),
      parameters.getFunctionBundle(context),
      parameters.getFunctionHash(),
      parameters.getFunctionVariables()
    ]);

    const importedFunction = await importFunction(logger, functionName);
    const bundleHash = await hashFile(sourceFile);

    if (importedFunction) {
      await updateSourceCode(logger, functionName, {
        architecture: parameters.architecture,
        publish: false,
        sourceFile
      });

      await updateConfiguration(logger, functionName, {
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

      await tagFunction(logger, importedFunction.functionArn, {
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

    const createdFunction = await createFunction(logger, {
      ...parameters,
      publish: true,
      functionName,
      sourceFile,
      logGroup,
      roleArn,
      variables: {
        ...variables,
        ...(release?.variableName && {
          [release.variableName]: release.version
        })
      },
      tags: {
        ...parameters.tags,
        ...(release?.tagName && {
          [release.tagName]: release.version
        })
      }
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
  });
};

const updateResource = (candidate: FunctionState, current: FunctionState, context: StepContext): Promise<FunctionResult> => {
  const { parameters, result } = candidate;
  const { functionName } = parameters;

  if (!result) {
    throw new CorruptedResourceError(FunctionServiceName, functionName);
  }

  return OperationLogger.logExecution(FunctionServiceName, functionName, 'updates', async (logger) => {
    const newVariables = await parameters.getFunctionVariables();
    const oldVariables = current.result?.variables ?? newVariables;

    const newRoleArn = getRoleArn(FunctionServiceName, functionName, context);
    const oldRoleArn = current.result?.roleArn ?? newRoleArn;

    const newLogGroup = getLogGroupName(FunctionServiceName, functionName, context);
    const oldLogGroup = current.result?.logGroup ?? newLogGroup;

    const { isUpdated, ...newResult } = await checkSourceCodeUpdates(logger, functionName, parameters, current.result, context);

    const newConfig = { ...parameters, variables: newVariables, roleArn: newRoleArn, logGroup: newLogGroup };
    const oldConfig = { ...current.parameters, variables: oldVariables, roleArn: oldRoleArn, logGroup: oldLogGroup };

    await checkConfigurationUpdates(logger, functionName, newConfig, oldConfig, isUpdated, context);
    await checkTagUpdates(logger, result.functionArn, parameters, current.parameters, isUpdated);

    return {
      ...result,
      ...newResult,
      variables: protectVariables(newVariables),
      logGroup: newLogGroup,
      roleArn: newRoleArn
    };
  });
};

const deleteResource = async (current: FunctionState) => {
  const { result, parameters } = current;

  if (!result) {
    return;
  }

  const { functionName } = parameters;

  await OperationLogger.logExecution(FunctionServiceName, functionName, 'deletion', async (logger) => {
    await deleteFunction(functionName, logger);
  });
};

const checkConfigurationUpdates = async (
  logger: OperationLogLine,
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
    await updateConfiguration(logger, functionName, {
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

const checkTagUpdates = async (
  logger: OperationLogLine,
  functionArn: Arn,
  candidate: FunctionParameters,
  current: FunctionParameters,
  isUpdated: boolean
) => {
  const hasReleaseChange = isUpdated && candidate.release?.version !== current.release?.version;
  const candidateRelease = hasReleaseChange ? candidate.release : undefined;

  const candidateTags = {
    ...candidate.tags,
    ...(candidateRelease?.tagName && {
      [candidateRelease.tagName]: candidateRelease.version
    })
  };

  await applyTagUpdates(
    candidateTags,
    current.tags,
    (tags) => tagFunction(logger, functionArn, tags),
    (tags) => untagFunction(logger, functionArn, tags)
  );
};

const checkSourceCodeUpdates = async (
  logger: OperationLogLine,
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
      logger.update(`Skipping source code update`);

      return {
        isUpdated: false,
        valuesHash: newValuesHash,
        sourceHash: newSourceHash
      };
    }

    const { functionVersion } = await updateSourceCode(logger, functionName, {
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
