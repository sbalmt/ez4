import type { StepContext, StepHandler } from '@ez4/stateful';
import type { PolicyState, PolicyResult } from './types.js';

import { ReplaceResourceError } from '@ez4/aws-common';

import { getBucketName } from '../bucket/utils.js';
import { createPolicy, deletePolicy } from './client.js';
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
  return !!candidate.result && candidate.result.bucketName === current.result?.bucketName;
};

const previewResource = async () => {
  // Policy is generated dynamically, no changes to compare.
  return undefined;
};

const replaceResource = async (
  candidate: PolicyState,
  current: PolicyState,
  context: StepContext
) => {
  if (current.result) {
    throw new ReplaceResourceError(PolicyServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = async (
  candidate: PolicyState,
  context: StepContext
): Promise<PolicyResult> => {
  const parameters = candidate.parameters;

  const bucketName = getBucketName(PolicyServiceName, 'policy', context);
  const role = await parameters.getRole(context);

  await createPolicy({
    bucketName,
    role
  });

  return {
    bucketName
  };
};

const updateResource = async () => {};

const deleteResource = async (candidate: PolicyState) => {
  const result = candidate.result;

  if (result) {
    await deletePolicy(result.bucketName);
  }
};
