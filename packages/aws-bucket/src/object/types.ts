import type { EntryState } from '@ez4/stateful';
import type { ResourceTags } from '@ez4/aws-common';
import type { CreateRequest, CreateResponse } from './client.js';

export const ObjectServiceName = 'AWS:S3/Object';

export const ObjectServiceType = 'aws:s3.object';

export type ObjectParameters = CreateRequest & {
  tags?: ResourceTags;
};

export type ObjectResult = CreateResponse & {
  lastModified: number;
  bucketName: string;
};

export type ObjectState = EntryState & {
  type: typeof ObjectServiceType;
  parameters: ObjectParameters;
  result?: ObjectResult;
};
