import type { EntryState } from '@ez4/stateful';
import type { CreateRequest, CreateResponse } from './client';

export const CacheServiceName = 'AWS:CloudFront/Cache';

export const CacheServiceType = 'aws:cloudfront.cache';

export type CacheParameters = CreateRequest;

export type CacheResult = CreateResponse;

export type CacheState = EntryState & {
  type: typeof CacheServiceType;
  parameters: CacheParameters;
  result?: CacheResult;
};
