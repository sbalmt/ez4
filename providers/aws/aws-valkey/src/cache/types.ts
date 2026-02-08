import type { EntryState } from '@ez4/stateful';
import type { CreateRequest, ImportOrCreateResponse } from './client';

export const CacheServiceName = 'AWS:Cache/Valkey';

export const CacheServiceType = 'aws:cache.valkey';

export type CacheParameters = CreateRequest;

export type CacheResult = ImportOrCreateResponse;

export type CacheState = EntryState & {
  type: typeof CacheServiceType;
  parameters: CacheParameters;
  result?: CacheResult;
};
