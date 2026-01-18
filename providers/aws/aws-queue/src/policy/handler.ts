import type { StepContext, StepHandler } from '@ez4/stateful';
import type { QueuePolicyResult, QueuePolicyState } from './types';

import { Logger, ReplaceResourceError } from '@ez4/aws-common';

import { getQueueUrl } from '../queue/utils';
import { attachPolicies, detachPolicy } from './client';
import { QueuePolicyServiceName } from './types';

export const getQueuePolicyHandler = (): StepHandler<QueuePolicyState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: QueuePolicyState, current: QueuePolicyState) => {
  return !!candidate.result && candidate.result.queueUrl === current.result?.queueUrl;
};

const previewResource = (_candidate: QueuePolicyState, _current: QueuePolicyState) => {
  // Policy is generated dynamically, no changes to compare.
  return undefined;
};

const replaceResource = async (candidate: QueuePolicyState, current: QueuePolicyState, context: StepContext) => {
  if (current.result) {
    throw new ReplaceResourceError(QueuePolicyServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = async (candidate: QueuePolicyState, context: StepContext): Promise<QueuePolicyResult> => {
  const { parameters } = candidate;

  return Logger.logOperation(QueuePolicyServiceName, parameters.fromService, 'creation', async (logger) => {
    const queueUrl = getQueueUrl(QueuePolicyServiceName, 'subscription', context);
    const permissions = await Promise.all(parameters.policyGetters.map((getPolicy) => getPolicy(context)));

    const { sourceArns } = await attachPolicies(logger, queueUrl, permissions);

    return {
      sourceArns,
      queueUrl
    };
  });
};

const updateResource = async () => {};

const deleteResource = async (current: QueuePolicyState) => {
  const { result, parameters } = current;

  if (!result) {
    return;
  }

  await Logger.logOperation(QueuePolicyServiceName, parameters.fromService, 'deletion', async (logger) => {
    await detachPolicy(logger, result.queueUrl);
  });
};
