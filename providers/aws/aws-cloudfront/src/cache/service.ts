import type { EntryState, EntryStates } from '@ez4/stateful';
import type { CacheParameters, CacheState } from './types';

import { hashData, toKebabCase } from '@ez4/utils';
import { attachEntry } from '@ez4/stateful';

import { CacheServiceType } from './types';

export const createCachePolicy = <E extends EntryState>(state: EntryStates<E>, parameters: CacheParameters) => {
  const policyName = toKebabCase(parameters.policyName);
  const policyId = hashData(CacheServiceType, policyName);

  return attachEntry<E | CacheState, CacheState>(state, {
    type: CacheServiceType,
    entryId: policyId,
    dependencies: [],
    parameters: {
      ...parameters,
      policyName
    }
  });
};
