import type { EntryState } from '@ez4/stateful';

export const InvalidationServiceName = 'AWS:CloudFront/Invalidation';

export const InvalidationServiceType = 'aws:cloudfront.invalidation';

export type InvalidationParameters = {
  contentVersion: string;
};

export type InvalidationResult = {
  distributionId: string;
};

export type InvalidationState = EntryState & {
  type: typeof InvalidationServiceType;
  parameters: InvalidationParameters;
  result?: InvalidationResult;
};
