import type { EntryState } from '@ez4/state';
import type { CreateRequest, ImportOrCreateResponse } from './client';

export const CacheServiceName = 'AWS:Cache/Valkey';

export const CacheServiceType = 'aws:cache.valkey';

export type CacheParameters = CreateRequest & {
  allowDeletion?: boolean;
};

export type CacheResult = ImportOrCreateResponse;

export type CacheState = EntryState & {
  type: typeof CacheServiceType;
  parameters: CacheParameters;
  result?: CacheResult;
};
