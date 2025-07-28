import type { EntryState, EntryStates } from '@ez4/stateful';
import type { GroupParameters, GroupState } from './types.js';

import { toKebabCase, hashData } from '@ez4/utils';
import { attachEntry } from '@ez4/stateful';

import { GroupServiceType } from './types.js';

export const createGroup = <E extends EntryState>(state: EntryStates<E>, parameters: GroupParameters) => {
  const groupName = toKebabCase(parameters.groupName);
  const groupId = hashData(GroupServiceType, groupName);

  return attachEntry<E | GroupState, GroupState>(state, {
    type: GroupServiceType,
    entryId: groupId,
    dependencies: [],
    parameters: {
      ...parameters,
      groupName
    }
  });
};
