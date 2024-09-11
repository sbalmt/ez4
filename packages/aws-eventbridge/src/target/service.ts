import type { FunctionState } from '@ez4/aws-function';
import type { EntryState, EntryStates } from '@ez4/stateful';
import type { TargetState } from './types.js';
import type { RuleState } from '../rule/types.js';

import { attachEntry } from '@ez4/stateful';
import { hashData } from '@ez4/utils';

import { TargetServiceType } from './types.js';

export const isTarget = (resource: EntryState): resource is TargetState => {
  return resource.type === TargetServiceType;
};

export const createTarget = <E extends EntryState>(
  state: EntryStates<E>,
  ruleState: RuleState,
  functionState: FunctionState
) => {
  const targetId = hashData(TargetServiceType, ruleState.entryId, functionState.entryId);

  return attachEntry<E | TargetState, TargetState>(state, {
    type: TargetServiceType,
    entryId: targetId,
    dependencies: [ruleState.entryId, functionState.entryId],
    parameters: {}
  });
};

export const getTarget = <E extends EntryState>(
  state: EntryStates<E>,
  ruleState: RuleState,
  functionState: FunctionState
) => {
  const targetId = hashData(TargetServiceType, ruleState.entryId, functionState.entryId);

  const targetState = state[targetId];

  if (targetState && isTarget(targetState)) {
    return targetState;
  }

  return null;
};
