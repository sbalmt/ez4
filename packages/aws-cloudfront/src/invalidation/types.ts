import type { ObjectResult } from '@ez4/aws-bucket';
import type { EntryState } from '@ez4/stateful';

export const InvalidationServiceName = 'AWS:CloudFront/Invalidation';

export const InvalidationServiceType = 'aws:cloudfront.invalidation';

export type InvalidationParameters = {
  files: string[];
};

export type LastChange = Pick<ObjectResult, 'objectKey' | 'lastModified'>;

export type InvalidationResult = {
  distributionId: string;
  lastModified: number;
  lastChanges: LastChange[];
};

export type InvalidationState = EntryState & {
  type: typeof InvalidationServiceType;
  parameters: InvalidationParameters;
  result?: InvalidationResult;
};
