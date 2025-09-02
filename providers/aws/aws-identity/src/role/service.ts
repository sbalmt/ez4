import type { EntryState, EntryStates } from '@ez4/stateful';
import type { PolicyState } from '../policy/types';
import type { RoleParameters, RoleState } from './types';

import { toKebabCase, hashData } from '@ez4/utils';
import { attachEntry } from '@ez4/stateful';

import { RoleServiceType } from './types';

export const createRole = <E extends EntryState>(state: EntryStates<E>, policyList: PolicyState[], parameters: RoleParameters) => {
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
