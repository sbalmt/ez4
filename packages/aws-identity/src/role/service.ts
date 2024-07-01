import type { EntryState, EntryStates } from '@ez4/stateful';
import type { PolicyState } from '../policy/types.js';
import type { RoleParameters, RoleState } from './types.js';

import { toKebabCase, hashData } from '@ez4/utils';
import { attachEntry } from '@ez4/stateful';

import { RoleServiceType } from './types.js';

export const isRole = (resource: EntryState): resource is RoleState => {
  return resource.type === RoleServiceType;
};

export const createRole = <E extends EntryState>(
  state: EntryStates<E>,
  policyList: PolicyState[],
  parameters: RoleParameters
) => {
  const roleName = toKebabCase(parameters.roleName);
  const roleId = hashData(RoleServiceType, roleName);

  return attachEntry<E | RoleState, RoleState>(state, {
    type: RoleServiceType,
    entryId: roleId,
    dependencies: policyList.map(({ entryId }) => entryId),
    parameters: {
      ...parameters,
      roleName
    }
  });
};
