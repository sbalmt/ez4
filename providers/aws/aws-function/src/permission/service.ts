import type { EntryState, EntryStates } from '@ez4/stateful';
import type { FunctionState } from '../function/types.js';
import type { PermissionParameters, PermissionState } from './types.js';

import { attachEntry } from '@ez4/stateful';
import { hashData } from '@ez4/utils';

import { PermissionServiceType } from './types.js';
import { isPermissionState } from './utils.js';

export const createPermission = <E extends EntryState>(
  state: EntryStates<E>,
  sourceState: EntryState,
  functionState: FunctionState,
  parameters: PermissionParameters
) => {
  const permissionId = hashData(PermissionServiceType, sourceState.entryId, functionState.entryId);

  return attachEntry<E | PermissionState, PermissionState>(state, {
    type: PermissionServiceType,
    entryId: permissionId,
    dependencies: [sourceState.entryId, functionState.entryId],
    parameters
  });
};

export const getPermission = <E extends EntryState>(state: EntryStates<E>, sourceState: EntryState, functionState: FunctionState) => {
  const permissionId = hashData(PermissionServiceType, sourceState.entryId, functionState.entryId);

  const permissionState = state[permissionId];

  if (permissionState && isPermissionState(permissionState)) {
    return permissionState;
  }

  return null;
};
