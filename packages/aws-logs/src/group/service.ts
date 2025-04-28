import type { EntryState, EntryStates } from '@ez4/stateful';
import type { LogGroupParameters, LogGroupState } from './types.js';

import { toKebabCase, hashData } from '@ez4/utils';
import { attachEntry } from '@ez4/stateful';

import { LogGroupServiceType } from './types.js';

export const createLogGroup = <E extends EntryState>(state: EntryStates<E>, parameters: LogGroupParameters) => {
  const groupName = toKebabCase(parameters.groupName);
  const groupId = hashData(LogGroupServiceType, groupName);

  return attachEntry<E | LogGroupState, LogGroupState>(state, {
    type: LogGroupServiceType,
    entryId: groupId,
    dependencies: [],
    parameters: {
      ...parameters,
      groupName
    }
  });
};
