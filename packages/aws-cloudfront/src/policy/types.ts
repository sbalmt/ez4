import type { EntryState } from '@ez4/stateful';
import type { CreateRequest, CreateResponse } from './client.js';

export const PolicyServiceName = 'AWS:CloudFront/Policy';

export const PolicyServiceType = 'aws:cloudfront.policy';

export type PolicyParameters = CreateRequest;

export type PolicyResult = CreateResponse;

export type PolicyState = EntryState & {
  type: typeof PolicyServiceType;
  parameters: PolicyParameters;
  result?: PolicyResult;
};
