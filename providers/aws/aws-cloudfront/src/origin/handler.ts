import type { StepHandler } from '@ez4/stateful';
import type { OriginState, OriginResult, OriginParameters } from './types';

import { ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import { createOriginPolicy, updateOriginPolicy, deleteOriginPolicy } from './client';
import { OriginServiceName } from './types';

export const getPolicyHandler = (): StepHandler<OriginState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: OriginState, current: OriginState) => {
  return !!candidate.result && candidate.result.policyId === current.result?.policyId;
};

const previewResource = (candidate: OriginState, current: OriginState) => {
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

const replaceResource = async (candidate: OriginState, current: OriginState) => {
  if (current.result) {
    throw new ReplaceResourceError(OriginServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate);
};

const createResource = async (candidate: OriginState): Promise<OriginResult> => {
  const { policyId } = await createOriginPolicy(candidate.parameters);

  return {
    policyId
  };
};

const updateResource = async (candidate: OriginState, current: OriginState) => {
  const { result, parameters } = candidate;

  if (!result) {
    return;
  }

  await checkGeneralUpdates(result.policyId, parameters, current.parameters);
};

const deleteResource = async (candidate: OriginState) => {
  const result = candidate.result;

  if (result) {
    await deleteOriginPolicy(result.policyId);
  }
};

const checkGeneralUpdates = async (policyId: string, candidate: OriginParameters, current: OriginParameters) => {
  const hasChanges = !deepEqual(candidate, current);

  if (hasChanges) {
    await updateOriginPolicy(policyId, candidate);
  }
};
