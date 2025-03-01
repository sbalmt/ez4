import type { RoleState } from '@ez4/aws-identity';
import type { FunctionState } from '@ez4/aws-function';
import type { EntryState, EntryStates } from '@ez4/stateful';
import type { GroupState } from '../group/types.js';
import type { ScheduleParameters, ScheduleState } from './types.js';

import { toKebabCase, hashData } from '@ez4/utils';
import { attachEntry } from '@ez4/stateful';

import { ScheduleServiceType } from './types.js';

export const createSchedule = <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  functionState: FunctionState,
  groupState: GroupState | undefined,
  parameters: ScheduleParameters
) => {
  const scheduleName = toKebabCase(parameters.scheduleName);
  const scheduleId = hashData(ScheduleServiceType, scheduleName);

  const dependencies = [roleState.entryId, functionState.entryId];

  if (groupState) {
    dependencies.push(groupState.entryId);
  }

  return attachEntry<E | ScheduleState, ScheduleState>(state, {
    type: ScheduleServiceType,
    entryId: scheduleId,
    dependencies,
    parameters: {
      ...parameters,
      scheduleName
    }
  });
};
