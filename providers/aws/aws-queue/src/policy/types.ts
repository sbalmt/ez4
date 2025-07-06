import type { EntryState, StepContext } from '@ez4/stateful';
import type { CreateRequest, CreateResponse } from './client.js';

export const PolicyServiceName = 'AWS:SQS/Policy';

export const PolicyServiceType = 'aws:sqs.policy';

export type Policy = Omit<CreateRequest, 'queueUrl'>;

export type GetPolicy = (context: StepContext) => Promise<Policy> | Policy;

export type PolicyParameters = {
  getPolicy: GetPolicy;
  fromService: string;
};

export type PolicyResult = CreateResponse & {
  queueUrl: string;
};

export type PolicyState = EntryState & {
  type: typeof PolicyServiceType;
  parameters: PolicyParameters;
  result?: PolicyResult;
};
