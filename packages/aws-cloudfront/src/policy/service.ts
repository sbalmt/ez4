import type { EntryState, EntryStates } from '@ez4/stateful';
import type { PolicyParameters, PolicyState } from './types.js';

import { hashData, toKebabCase } from '@ez4/utils';
import { attachEntry } from '@ez4/stateful';

import { PolicyServiceType } from './types.js';

export const isCachePolicy = (resource: EntryState): resource is PolicyState => {
  return resource.type === PolicyServiceType;
};

export const createCachePolicy = <E extends EntryState>(
  state: EntryStates<E>,
  parameters: PolicyParameters
) => {
  const policyName = toKebabCase(parameters.policyName);
  const policyId = hashData(PolicyServiceType, policyName);

  return attachEntry<E | PolicyState, PolicyState>(state, {
    type: PolicyServiceType,
    entryId: policyId,
    dependencies: [],
    parameters: {
      ...parameters,
      policyName
    }
  });
};
