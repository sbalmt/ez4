import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { EntryState } from '@ez4/stateful';
import type { CacheState } from './types';

import { hashData, toKebabCase } from '@ez4/utils';

import { CacheNotFoundError } from './errors';
import { CacheServiceType } from './types';

export const createCacheStateId = (identity: string) => {
  return hashData(CacheServiceType, toKebabCase(identity));
};

export const isCacheState = (resource: EntryState): resource is CacheState => {
  return resource.type === CacheServiceType;
};

export const getCacheState = (context: EventContext, cacheName: string, options: DeployOptions) => {
  const cacheState = context.getServiceState(cacheName, options);

  if (!isCacheState(cacheState)) {
    throw new CacheNotFoundError(cacheName);
  }

  return cacheState;
};
