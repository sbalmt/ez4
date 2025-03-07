import type { Arn, ResourceTags } from '@ez4/aws-common';
import type { EntryState } from '@ez4/stateful';
import type { Bucket } from '@ez4/storage';
import type { CreateRequest, CreateResponse } from './client.js';

export const BucketServiceName = 'AWS:S3/Bucket';

export const BucketServiceType = 'aws:s3.bucket';

export type BucketParameters = CreateRequest & {
  bucketId: string;
  eventsPath?: string;
  autoExpireDays?: number;
  localPath?: string;
  tags?: ResourceTags;
  cors?: Bucket.Cors;
};

export type BucketResult = CreateResponse & {
  functionArn: Arn | undefined;
};

export type BucketState = EntryState & {
  type: typeof BucketServiceType;
  parameters: BucketParameters;
  result?: BucketResult;
};
