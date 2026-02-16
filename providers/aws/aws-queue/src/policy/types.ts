import type { EntryState, StepContext } from '@ez4/stateful';
import type { AttachRequest, AttachResponse } from './client';

export const QueuePolicyServiceName = 'AWS:SQS/Policy';

export const QueuePolicyServiceType = 'aws:sqs.policy';

export type QueuePolicy = Omit<AttachRequest, 'queueUrl'>;

export type QueuePolicyGetter = (context: StepContext) => Promise<QueuePolicy> | QueuePolicy;

export type QueuePolicyParameters = {
  policyGetters: QueuePolicyGetter[];
  fromService: string;
  toService: string;
};

export type QueuePolicyResult = AttachResponse & {
  queueUrl: string;
};

export type QueuePolicyState = EntryState & {
  type: typeof QueuePolicyServiceType;
  parameters: QueuePolicyParameters;
  result?: QueuePolicyResult;
};
