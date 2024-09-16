import type { Arn } from '@ez4/aws-common';
import type { StepContext, StepHandler } from '@ez4/stateful';
import type { FunctionState, FunctionResult, FunctionParameters } from './types.js';

import { InvalidParameterValueException } from '@aws-sdk/client-lambda';
import { applyTagUpdates, ReplaceResourceError, waitDeletion } from '@ez4/aws-common';
import { deepCompare, deepEqual, hashFile, waitFor } from '@ez4/utils';
import { getRoleArn } from '@ez4/aws-identity';

import {
  createFunction,
  deleteFunction,
  tagFunction,
  updateSourceCode,
  updateConfiguration,
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

const lockSensitiveData = (candidate: FunctionState) => {
  const { parameters } = candidate;

  if (parameters.variables) {
    parameters.variables = protectVariables(parameters.variables);
  }

  return candidate;
};

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
      sourceHash: await hashFile(target.sourceFile),
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

  // If the given roleArn is new and still propagating on AWS, the creation
  // will fail, `waitFor` will keep retrying until max attempts.
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

  lockSensitiveData(candidate);

  return {
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
  const { parameters, result } = candidate;

  if (!result) {
    return;
  }

  const functionName = parameters.functionName;

  const newRoleArn = getRoleArn(FunctionServiceName, functionName, context);
  const oldRoleArn = current.result?.roleArn ?? newRoleArn;

  const newConfig = { ...parameters, roleArn: newRoleArn };
  const oldConfig = { ...current.parameters, roleArn: oldRoleArn };

  await Promise.all([
    checkConfigurationUpdates(functionName, newConfig, oldConfig),
    checkTagUpdates(result.functionArn, parameters, current.parameters)
  ]);

  // Should always perform for last.
  const sourceHash = await checkSourceCodeUpdates(functionName, parameters, current.result);

  lockSensitiveData(candidate);

  return {
    ...result,
    roleArn: newRoleArn,
    sourceHash
  };
};

const deleteResource = async (candidate: FunctionState) => {
  const { result, parameters } = candidate;

  if (result) {
    // If the function is still in use due to a prior change that's not
    // done yet, keep retrying until max attempts.
    await waitDeletion(() => deleteFunction(parameters.functionName));
  }
};

const checkConfigurationUpdates = async <T extends FunctionParameters>(
  functionName: string,
  candidate: T,
  current: T
) => {
  const protectedCandidate = {
    ...candidate,
    ...(candidate.variables && {
      variables: protectVariables(candidate.variables)
    })
  };

  const hasChanges = !deepEqual(protectedCandidate, current, {
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

  const newSourceHash = await hashFile(sourceFile);
  const oldSourceHash = current?.sourceHash;

  if (newSourceHash !== oldSourceHash) {
    await updateSourceCode(functionName, candidate);

    return newSourceHash;
  }

  return oldSourceHash;
};
