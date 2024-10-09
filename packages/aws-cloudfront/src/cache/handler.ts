import type { StepHandler } from '@ez4/stateful';
import type { CacheState, CacheResult, CacheParameters } from './types.js';

import { ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import { createCachePolicy, updateCachePolicy, deleteCachePolicy } from './client.js';
import { CacheServiceName } from './types.js';

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

const previewResource = async (candidate: CacheState, current: CacheState) => {
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

const createResource = async (candidate: CacheState): Promise<CacheResult> => {
  const { policyId } = await createCachePolicy(candidate.parameters);

  return {
    policyId
  };
};

const updateResource = async (candidate: CacheState, current: CacheState) => {
  const { result, parameters } = candidate;

  if (!result) {
    return;
  }

  await checkGeneralUpdates(result.policyId, parameters, current.parameters);
};

const deleteResource = async (candidate: CacheState) => {
  const result = candidate.result;

  if (result) {
    await deleteCachePolicy(result.policyId);
  }
};

const checkGeneralUpdates = async (
  policyId: string,
  candidate: CacheParameters,
  current: CacheParameters
) => {
  const hasChanges = !deepEqual(candidate, current);

  if (hasChanges) {
    await updateCachePolicy(policyId, candidate);
  }
};
