import type { EntryState } from '@ez4/stateful';
import type { CreateRequest, CreateResponse } from './client.js';

export const DistributionServiceName = 'AWS:CloudFront/Distribution';

export const DistributionServiceType = 'aws:cloudfront.distribution';

export type DistributionParameters = CreateRequest;

export type DistributionResult = CreateResponse;

export type DistributionState = EntryState & {
  type: typeof DistributionServiceType;
  parameters: DistributionParameters;
  result?: DistributionResult;
};
