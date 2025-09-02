import type { EntryState, EntryStates } from '@ez4/stateful';
import type { PolicyParameters, PolicyState } from './types';

import { toKebabCase, hashData } from '@ez4/utils';
import { attachEntry } from '@ez4/stateful';

import { PolicyServiceType } from './types';

export const createPolicy = <E extends EntryState>(state: EntryStates<E>, parameters: PolicyParameters) => {
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

export const tryGetPolicy = <E extends EntryState>(state: EntryStates<E>, policyName: string) => {
  const policyId = hashData(PolicyServiceType, toKebabCase(policyName));

  return state[policyId];
};
