import type { Arn } from '@ez4/aws-common';
import type { EntryState, StepContext } from '@ez4/stateful';
import type { AttachRequest, AttachResponse } from './client';

export const BucketEventServiceName = 'AWS:S3/Event';

export const BucketEventServiceType = 'aws:s3.event';

export type BucketEvent = AttachRequest;

export type BucketEventGetter = (context: StepContext) => Promise<BucketEvent> | BucketEvent;

export type BucketEventParameters = {
  eventGetters: BucketEventGetter[];
  toService: string;
};

export type BucketEventResult = AttachResponse & {
  functionArns: Arn[];
  bucketName: string;
};

export type BucketEventState = EntryState & {
  type: typeof BucketEventServiceType;
  parameters: BucketEventParameters;
  result?: BucketEventResult;
};
