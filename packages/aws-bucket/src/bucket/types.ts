import type { EntryState } from '@ez4/stateful';
import type { ResourceTags } from '@ez4/aws-common';
import type { Bucket } from '@ez4/storage';
import type { CreateRequest, CreateResponse } from './client.js';

export const BucketServiceName = 'AWS:S3/Bucket';

export const BucketServiceType = 'aws:s3.bucket';

export type BucketParameters = CreateRequest & {
  autoExpireDays?: number;
  localPath?: string;
  tags?: ResourceTags;
  cors?: Bucket.Cors;
};

export type BucketResult = CreateResponse;

export type BucketState = EntryState & {
  type: typeof BucketServiceType;
  parameters: BucketParameters;
  result?: BucketResult;
};
