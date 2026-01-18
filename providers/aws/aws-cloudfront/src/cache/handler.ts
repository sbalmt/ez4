import type { StepHandler } from '@ez4/stateful';
import type { CacheState, CacheResult, CacheParameters } from './types';

import { CorruptedResourceError, Logger, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import { createCachePolicy, updateCachePolicy, deleteCachePolicy } from './client';
import { CacheServiceName } from './types';

export const getPolicyHandler = (): StepHandler<CacheState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: CacheState, current: CacheState) => {
  return !!candidate.result && candidate.result.policyId === current.result?.policyId;
};

const previewResource = (candidate: CacheState, current: CacheState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source);

  if (!changes.counts) {
    return undefined;
  }

  return {
    ...changes,
    name: target.policyName
  };
};

const replaceResource = async (candidate: CacheState, current: CacheState) => {
  if (current.result) {
    throw new ReplaceResourceError(CacheServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate);
};

const createResource = (candidate: CacheState): Promise<CacheResult> => {
  const { policyName } = candidate.parameters;

  return Logger.logOperation(CacheServiceName, policyName, 'creation', async (logger) => {
    const { policyId } = await createCachePolicy(logger, candidate.parameters);

    return {
      policyId
    };
  });
};

const updateResource = (candidate: CacheState, current: CacheState): Promise<CacheResult> => {
  const { result, parameters } = candidate;
  const { policyName } = parameters;

  if (!result) {
    throw new CorruptedResourceError(CacheServiceName, policyName);
  }

  return Logger.logOperation(CacheServiceName, policyName, 'updates', async (logger) => {
    await checkGeneralUpdates(logger, result.policyId, parameters, current.parameters);

    return result;
  });
};

const deleteResource = async (current: CacheState) => {
  const { parameters, result } = current;

  if (result) {
    const policyName = parameters.policyName;

    await Logger.logOperation(CacheServiceName, policyName, 'deletion', async (logger) => {
      await deleteCachePolicy(logger, result.policyId);
    });
  }
};

const checkGeneralUpdates = async (
  logger: Logger.OperationLogger,
  policyId: string,
  candidate: CacheParameters,
  current: CacheParameters
) => {
  const hasChanges = !deepEqual(candidate, current);

  if (hasChanges) {
    await updateCachePolicy(logger, policyId, candidate);
  }
};
