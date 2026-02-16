import type { EntryState, EntryStates } from '@ez4/stateful';
import type { IdentityParameters, IdentityState } from './types';

import { attachEntry } from '@ez4/stateful';

import { createIdentityStateId } from './utils';
import { IdentityServiceType } from './types';

export const createIdentity = <E extends EntryState>(state: EntryStates<E>, parameters: IdentityParameters) => {
  const identityId = createIdentityStateId(parameters.identity);

  return attachEntry<E | IdentityState, IdentityState>(state, {
    type: IdentityServiceType,
    entryId: identityId,
    dependencies: [],
    parameters
  });
};
