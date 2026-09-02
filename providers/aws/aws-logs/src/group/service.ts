import type { EntryState, EntryStates } from '@ez4/state';
import type { LogGroupParameters, LogGroupState } from './types';

import { attachEntry, tryLinkEntryDependency } from '@ez4/state';
import { toKebabCase, hashData } from '@ez4/utils';

import { LogGroupServiceType } from './types';

export const createLogGroup = <E extends EntryState>(state: EntryStates<E>, parameters: LogGroupParameters) => {
  const { dependencies = [], ...inputParameters } = parameters;

  const groupName = toKebabCase(parameters.groupName);
  const groupId = hashData(LogGroupServiceType, groupName);

  const logGroupState = attachEntry<E | LogGroupState, LogGroupState>(state, {
    type: LogGroupServiceType,
    entryId: groupId,
    dependencies: [],
    parameters: {
      ...inputParameters,
      groupName
    }
  });

  dependencies.forEach((dependencyId) => {
    tryLinkEntryDependency(state, groupId, dependencyId);
  });

  return logGroupState;
};
