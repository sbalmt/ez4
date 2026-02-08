import type { EntryState, EntryStates } from '@ez4/stateful';
import type { CacheParameters, CacheState } from './types';

import { attachEntry } from '@ez4/stateful';

import { createCacheStateId } from './utils';
import { CacheServiceType } from './types';

export const createCache = <E extends EntryState>(state: EntryStates<E>, parameters: CacheParameters) => {
  const cacheId = createCacheStateId(parameters.name);

  return attachEntry<E | CacheState, CacheState>(state, {
    type: CacheServiceType,
    entryId: cacheId,
    dependencies: [],
    parameters
  });
};
