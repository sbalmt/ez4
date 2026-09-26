import type { EntryState, StepContext } from '@ez4/state';
import type { BucketEventType } from '@ez4/storage';
import type { Arn } from '@ez4/aws-common';
import type { AttachRequest, AttachResponse } from './client';

export const BucketEventServiceName = 'AWS:S3/Event';

export const BucketEventServiceType = 'aws:s3.event';

export type BucketEvent = AttachRequest;

export type BucketEventGetter = (context: StepContext) => BucketEvent;

export type BucketEventParameters = {
  eventGetters: BucketEventGetter[];
  triggers: BucketEventType[];
  toService: string;
  fromPath: string;
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
