import type { EntryState, EntryStates } from '@ez4/stateful';
import type { QueueState } from '../queue/types';
import type { QueuePolicyParameters, QueuePolicyState } from './types';

import { attachEntry } from '@ez4/stateful';
import { hashData } from '@ez4/utils';

import { QueuePolicyServiceType } from './types';
import { isQueuePolicyState } from './utils';

export const createQueuePolicy = <E extends EntryState>(
  state: EntryStates<E>,
  queueState: QueueState,
  sourceState: EntryState,
  parameters: QueuePolicyParameters
) => {
  const policyId = hashData(QueuePolicyServiceType, queueState.entryId);

  return attachEntry<E | QueuePolicyState, QueuePolicyState>(state, {
    type: QueuePolicyServiceType,
    entryId: policyId,
    dependencies: [sourceState.entryId, queueState.entryId],
    parameters
  });
};

export const getQueuePolicy = <E extends EntryState>(state: EntryStates<E>, queueState: QueueState) => {
  const policyId = hashData(QueuePolicyServiceType, queueState.entryId);

  const policyState = state[policyId];

  if (policyState && isQueuePolicyState(policyState)) {
    return policyState;
  }

  return null;
};

export const attachQueuePolicy = <E extends EntryState>(
  state: EntryStates<E>,
  queueState: QueueState,
  sourceState: EntryState,
  parameters: QueuePolicyParameters
) => {
  const policyState = getQueuePolicy(state, queueState);

  if (!policyState) {
    return createQueuePolicy(state, queueState, sourceState, parameters);
  }

  policyState.parameters.fromService += `, ${parameters.fromService}`;
  policyState.parameters.policyGetters.push(...parameters.policyGetters);

  return policyState;
};
