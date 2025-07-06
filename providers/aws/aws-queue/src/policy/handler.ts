import type { StepContext, StepHandler } from '@ez4/stateful';
import type { PolicyResult, PolicyState } from './types.js';

import { ReplaceResourceError } from '@ez4/aws-common';

import { getQueueUrl } from '../queue/utils.js';
import { attachPolicy, detachPolicy } from './client.js';
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
  return !!candidate.result && candidate.result.queueUrl === current.result?.queueUrl;
};

const previewResource = async (_candidate: PolicyState, _current: PolicyState) => {
  // Policy is generated dynamically, no changes to compare.
  return undefined;
};

const replaceResource = async (candidate: PolicyState, current: PolicyState, context: StepContext) => {
  if (current.result) {
    throw new ReplaceResourceError(PolicyServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = async (candidate: PolicyState, context: StepContext): Promise<PolicyResult> => {
  const parameters = candidate.parameters;

  const queueUrl = getQueueUrl(PolicyServiceName, 'subscription', context);
  const permission = await parameters.getPolicy(context);

  const response = await attachPolicy(queueUrl, {
    principal: permission.principal,
    sourceArn: permission.sourceArn
  });

  return {
    sourceArn: response.sourceArn,
    queueUrl
  };
};

const updateResource = async () => {};

const deleteResource = async (candidate: PolicyState) => {
  const result = candidate.result;

  if (result) {
    await detachPolicy(result.queueUrl, result.sourceArn);
  }
};
