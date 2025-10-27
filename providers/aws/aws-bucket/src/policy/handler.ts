import type { StepContext, StepHandler } from '@ez4/stateful';
import type { PolicyState, PolicyResult } from './types';

import { ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare } from '@ez4/utils';

import { getBucketName } from '../bucket/utils';
import { createPolicy, deletePolicy } from './client';
import { PolicyServiceName } from './types';

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

const previewResource = (candidate: PolicyState, current: PolicyState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source, {
    exclude: {
      getRole: true
    }
  });

  if (!changes.counts) {
    return undefined;
  }

  return {
    ...changes,
    name: target.fromService
  };
};

const replaceResource = async (candidate: PolicyState, current: PolicyState, context: StepContext) => {
  if (current.result) {
    throw new ReplaceResourceError(PolicyServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = async (candidate: PolicyState, context: StepContext): Promise<PolicyResult> => {
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
