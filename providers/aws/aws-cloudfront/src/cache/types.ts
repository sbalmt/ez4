import type { EntryState } from '@ez4/state';
import type { CreateRequest, ImportOrCreateResponse } from './client';

export const CacheServiceName = 'AWS:CloudFront/Cache';

export const CacheServiceType = 'aws:cloudfront.cache';

export type CacheParameters = CreateRequest;

export type CacheResult = ImportOrCreateResponse;

export type CacheState = EntryState & {
  type: typeof CacheServiceType;
  parameters: CacheParameters;
  result?: CacheResult;
};
