import type { StepContext, StepHandler } from '@ez4/stateful';
import type { LogPolicyResult, LogPolicyState } from './types';

import { ReplaceResourceError } from '@ez4/aws-common';

import { getLogGroupArn } from '../group/utils';
import { attachPolicy, detachPolicy } from './client';
import { LogPolicyServiceName } from './types';

export const getLogPolicyHandler = (): StepHandler<LogPolicyState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: LogPolicyState, current: LogPolicyState) => {
  return !!candidate.result && candidate.result.groupArn === current.result?.groupArn;
};

const previewResource = (_candidate: LogPolicyState, _current: LogPolicyState) => {
  // Policy is generated dynamically, no changes to compare.
  return undefined;
};

const replaceResource = async (candidate: LogPolicyState, current: LogPolicyState, context: StepContext) => {
  if (current.result) {
    throw new ReplaceResourceError(LogPolicyServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate, context);
};

const createResource = async (candidate: LogPolicyState, context: StepContext): Promise<LogPolicyResult> => {
  const parameters = candidate.parameters;

  const groupArn = getLogGroupArn(LogPolicyServiceName, 'policy', context);
  const permissions = await parameters.policyGetter(context);

  const { revisionId } = await attachPolicy(groupArn, permissions);

  return {
    revisionId,
    groupArn
  };
};

const updateResource = async () => {};

const deleteResource = async ({ result }: LogPolicyState) => {
  const revisionId = result?.revisionId;
  const groupArn = result?.groupArn;

  if (groupArn && revisionId) {
    await detachPolicy(groupArn, revisionId);
  }
};
