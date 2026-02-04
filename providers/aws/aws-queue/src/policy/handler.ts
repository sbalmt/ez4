import type { StepContext, StepHandler } from '@ez4/stateful';
import type { QueuePolicyResult, QueuePolicyState } from './types';

import { OperationLogger, ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare } from '@ez4/utils';

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

const previewResource = (candidate: QueuePolicyState, current: QueuePolicyState) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const changes = deepCompare(target, source, {
    exclude: {
      policyGetters: true
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

const replaceResource = async (candidate: QueuePolicyState, current: QueuePolicyState, context: StepContext) => {
  if (current.result) {
    throw new ReplaceResourceError(QueuePolicyServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = (candidate: QueuePolicyState, context: StepContext): Promise<QueuePolicyResult> => {
  const { parameters } = candidate;

  return OperationLogger.logExecution(QueuePolicyServiceName, parameters.fromService, 'creation', async (logger) => {
    const queueUrl = getQueueUrl(QueuePolicyServiceName, 'subscription', context);

    const permissions = await Promise.all(parameters.policyGetters.map((getPolicy) => getPolicy(context)));

    const { sourceArns } = await attachPolicies(logger, queueUrl, permissions);

    return {
      sourceArns,
      queueUrl
    };
  });
};

const updateResource = (candidate: QueuePolicyState, _current: QueuePolicyState, context: StepContext): Promise<QueuePolicyResult> => {
  const { parameters } = candidate;

  return OperationLogger.logExecution(QueuePolicyServiceName, parameters.fromService, 'updates', async (logger) => {
    const queueUrl = getQueueUrl(QueuePolicyServiceName, 'subscription', context);

    const permissions = await Promise.all(parameters.policyGetters.map((getPolicy) => getPolicy(context)));

    const { sourceArns } = await attachPolicies(logger, queueUrl, permissions);

    return {
      sourceArns,
      queueUrl
    };
  });
};

const deleteResource = async (current: QueuePolicyState) => {
  const { result, parameters } = current;

  if (!result) {
    return;
  }

  const { fromService } = parameters;
  const { queueUrl } = result;

  await OperationLogger.logExecution(QueuePolicyServiceName, fromService, 'deletion', async (logger) => {
    await detachPolicy(logger, queueUrl);
  });
};
