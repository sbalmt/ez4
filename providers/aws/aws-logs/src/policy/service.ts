import type { EntryState, EntryStates } from '@ez4/stateful';
import type { LogGroupState } from '../group/types';
import type { LogPolicyParameters, LogPolicyState } from './types';

import { attachEntry } from '@ez4/stateful';
import { hashData } from '@ez4/utils';

import { LogPolicyServiceType } from './types';

export const createLogPolicy = <E extends EntryState>(
  state: EntryStates<E>,
  groupState: LogGroupState,
  sourceState: EntryState,
  parameters: LogPolicyParameters
) => {
  const policyId = hashData(LogPolicyServiceType, groupState.entryId);

  return attachEntry<E | LogPolicyState, LogPolicyState>(state, {
    type: LogPolicyServiceType,
    entryId: policyId,
    dependencies: [sourceState.entryId, groupState.entryId],
    parameters
  });
};
