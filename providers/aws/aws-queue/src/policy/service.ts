import type { EntryState, EntryStates } from '@ez4/stateful';
import type { QueueState } from '../queue/types.js';
import type { PolicyParameters, PolicyState } from './types.js';

import { attachEntry } from '@ez4/stateful';
import { hashData } from '@ez4/utils';

import { PolicyServiceType } from './types.js';
import { isPolicyState } from './utils.js';

export const createPolicy = <E extends EntryState>(
  state: EntryStates<E>,
  sourceState: EntryState,
  queueState: QueueState,
  parameters: PolicyParameters
) => {
  const policyId = hashData(PolicyServiceType, sourceState.entryId, queueState.entryId);

  return attachEntry<E | PolicyState, PolicyState>(state, {
    type: PolicyServiceType,
    entryId: policyId,
    dependencies: [sourceState.entryId, queueState.entryId],
    parameters
  });
};

export const getPolicy = <E extends EntryState>(state: EntryStates<E>, sourceState: EntryState, queueState: QueueState) => {
  const policyId = hashData(PolicyServiceType, sourceState.entryId, queueState.entryId);

  const policyState = state[policyId];

  if (policyState && isPolicyState(policyState)) {
    return policyState;
  }

  return null;
};
