import type { EntryState, StepContext } from '@ez4/stateful';
import type { Arn } from '@ez4/aws-common';
import type { AttachRequest, AttachResponse } from './client';

export const LogPolicyServiceName = 'AWS:Log/Policy';

export const LogPolicyServiceType = 'aws:log.policy';

export type LogPolicy = Omit<AttachRequest, 'groupArn'>;

export type LogPolicyGetter = (context: StepContext) => Promise<LogPolicy> | LogPolicy;

export type LogPolicyParameters = {
  policyGetter: LogPolicyGetter;
  fromService: string;
};

export type LogPolicyResult = AttachResponse & {
  revisionId: string;
  groupArn: Arn;
};

export type LogPolicyState = EntryState & {
  type: typeof LogPolicyServiceType;
  parameters: LogPolicyParameters;
  result?: LogPolicyResult;
};
