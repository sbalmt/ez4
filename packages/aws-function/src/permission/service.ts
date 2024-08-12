import type { EntryState, EntryStates } from '@ez4/stateful';
import type { FunctionState } from '../function/types.js';
import type { PermissionParameters, PermissionState } from './types.js';

import { hashData } from '@ez4/utils';
import { attachEntry } from '@ez4/stateful';

import { PermissionServiceType } from './types.js';

export const isPermission = (resource: EntryState): resource is PermissionState => {
  return resource.type === PermissionServiceType;
};

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
