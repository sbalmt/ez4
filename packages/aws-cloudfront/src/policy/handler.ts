import type { StepHandler } from '@ez4/stateful';
import type { PolicyState, PolicyResult, PolicyParameters } from './types.js';

import { ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare, deepEqual } from '@ez4/utils';

import { createPolicy, updatePolicy, deletePolicy } from './client.js';
import { PolicyServiceName } from './types.js';

export const getPolicyHandler = (): StepHandler<PolicyState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: PolicyState, current: PolicyState) => {
  return !!candidate.result && candidate.result.policyId === current.result?.policyId;
};

const previewResource = async (candidate: PolicyState, current: PolicyState) => {
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

const replaceResource = async (candidate: PolicyState, current: PolicyState) => {
  if (current.result) {
    throw new ReplaceResourceError(PolicyServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate);
};

const createResource = async (candidate: PolicyState): Promise<PolicyResult> => {
  const { policyId, version } = await createPolicy(candidate.parameters);

  return {
    policyId,
    version
  };
};

const updateResource = async (
  candidate: PolicyState,
  current: PolicyState
): Promise<PolicyResult | void> => {
  const { result, parameters } = candidate;

  if (!result) {
    return;
  }

  const { policyId, version } = await checkGeneralUpdates(result, parameters, current.parameters);

  return {
    policyId,
    version
  };
};

const deleteResource = async (candidate: PolicyState) => {
  const result = candidate.result;

  if (result) {
    await deletePolicy(result.policyId, result.version);
  }
};

const checkGeneralUpdates = async (
  result: PolicyResult,
  candidate: PolicyParameters,
  current: PolicyParameters
) => {
  const hasChanges = !deepEqual(candidate, current);

  if (hasChanges) {
    return updatePolicy(result.policyId, result.version, candidate);
  }

  return result;
};