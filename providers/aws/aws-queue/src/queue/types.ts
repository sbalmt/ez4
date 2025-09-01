import type { EntryState } from '@ez4/stateful';
import type { Arn } from '@ez4/aws-common';
import type { CreateRequest, CreateResponse, DeadLetter } from './client';

export const QueueServiceName = 'AWS:SQS/Queue';

export const QueueServiceType = 'aws:sqs.queue';

export type QueueDeadLetter = Omit<DeadLetter, 'targetQueueArn'>;

export type QueueParameters = Omit<CreateRequest, 'deadLetter'> & {
  deadLetter?: QueueDeadLetter;
  import?: boolean;
};

export type QueueResult = CreateResponse & {
  deadLetterArn?: Arn;
};

export type QueueState = EntryState & {
  type: typeof QueueServiceType;
  parameters: QueueParameters;
  result?: QueueResult;
};
