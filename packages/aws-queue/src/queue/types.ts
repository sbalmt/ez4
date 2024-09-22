import type { EntryState } from '@ez4/stateful';
import type { CreateRequest, CreateResponse } from './client.js';

export const QueueServiceName = 'AWS:SQS/Queue';

export const QueueServiceType = 'aws:sqs.queue';

export type QueueParameters = CreateRequest & {
  import?: boolean;
};

export type QueueResult = CreateResponse;

export type QueueState = EntryState & {
  type: typeof QueueServiceType;
  parameters: QueueParameters;
  result?: QueueResult;
};
