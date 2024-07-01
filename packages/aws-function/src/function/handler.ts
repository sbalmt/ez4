import type { Arn } from '@ez4/aws-common';
import type { StepContext, StepHandler } from '@ez4/stateful';
import type { FunctionState, FunctionResult, FunctionParameters } from './types.js';

import { InvalidParameterValueException } from '@aws-sdk/client-lambda';

import { getRoleArn } from '@ez4/aws-identity';
import { applyTagUpdates, ReplaceResourceError } from '@ez4/aws-common';
import { deepEqual, hashFile, waitFor } from '@ez4/utils';

import {
  createFunction,
  deleteFunction,
  tagFunction,
  updateSourceCode,
  updateConfiguration,
  untagFunction
} from './client.js';

import { FunctionServiceName } from './types.js';

export const getFunctionHandler = (): StepHandler<FunctionState> => ({
  equals: equalsResource,
  replace: replaceResource,
  create: createResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: FunctionState, current: FunctionState) => {
  return !!candidate.result && candidate.result.functionArn === current.result?.functionArn;
};

const replaceResource = async (
  candidate: FunctionState,
  current: FunctionState,
  context: StepContext
) => {
  if (current.result) {
    throw new ReplaceResourceError(FunctionServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = async (
  candidate: FunctionState,
  context: StepContext
): Promise<FunctionResult> => {
  const parameters = candidate.parameters;

  const functionName = parameters.functionName;
  const roleArn = getRoleArn(FunctionServiceName, functionName, context);

  const sourceFile = parameters.sourceFile;
  const sourceHash = await hashFile(sourceFile);

  let lastError;

  const response = await waitFor(async () => {
    try {
      return await createFunction({
        ...parameters,
        sourceFile,
        roleArn
      });
    } catch (error) {
      if (!(error instanceof InvalidParameterValueException)) {
        throw error;
      }

      lastError = error;

      return null;
    }
  });

  if (!response) {
    throw lastError;
  }

  return {
    functionName: response.functionName,
    functionArn: response.functionArn,
    sourceHash,
    roleArn
  };
};

const updateResource = async (
  candidate: FunctionState,
  current: FunctionState,
  context: StepContext
) => {
  const result = candidate.result;

  if (!result) {
    return;
  }

  const functionName = candidate.parameters.functionName;

  const newRoleArn = getRoleArn(FunctionServiceName, functionName, context);
  const oldRoleArn = current.result?.roleArn ?? newRoleArn;

  const newConfig = { ...candidate.parameters, roleArn: newRoleArn };
  const oldConfig = { ...current.parameters, roleArn: oldRoleArn };

  await Promise.all([
    checkConfigurationUpdates(functionName, newConfig, oldConfig),
    checkTagUpdates(result.functionArn, candidate.parameters, current.parameters)
  ]);

  // Should always perform for last.
  const newSourceHash = await checkSourceCodeUpdates(
    functionName,
    candidate.parameters,
    current.result
  );

  return {
    ...result,
    sourceHash: newSourceHash,
    roleArn: newRoleArn
  };
};

const deleteResource = async (candidate: FunctionState) => {
  const result = candidate.result;

  if (result) {
    await deleteFunction(result.functionName);
  }
};

const checkConfigurationUpdates = async <T extends FunctionParameters>(
  functionName: string,
  candidate: T,
  current: T
) => {
  const hasChanges = !deepEqual(candidate, current, {
    sourceFile: true,
    functionName: true,
    tags: true
  });

  if (hasChanges) {
    await updateConfiguration(functionName, candidate);
  }
};

const checkTagUpdates = async (
  functionArn: Arn,
  candidate: FunctionParameters,
  current: FunctionParameters
) => {
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
  current: FunctionResult | undefined
) => {
  const sourceFile = candidate.sourceFile;
  const sourceHash = await hashFile(sourceFile);

  if (sourceHash !== current?.sourceHash) {
    await updateSourceCode(functionName, sourceFile);
  }

  return sourceHash;
};
