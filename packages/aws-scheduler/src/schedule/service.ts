import type { RoleState } from '@ez4/aws-identity';
import type { FunctionState } from '@ez4/aws-function';
import type { EntryState, EntryStates } from '@ez4/stateful';
import type { ScheduleParameters, ScheduleState } from './types.js';

import { toKebabCase, hashData } from '@ez4/utils';
import { attachEntry } from '@ez4/stateful';

import { ScheduleServiceType } from './types.js';

export const isSchedule = (resource: EntryState): resource is ScheduleState => {
  return resource.type === ScheduleServiceType;
};

export const createSchedule = <E extends EntryState>(
  state: EntryStates<E>,
  roleState: RoleState,
  functionState: FunctionState,
  parameters: ScheduleParameters
) => {
  const scheduleName = toKebabCase(parameters.scheduleName);
  const scheduleId = hashData(ScheduleServiceType, scheduleName);

  return attachEntry<E | ScheduleState, ScheduleState>(state, {
    type: ScheduleServiceType,
    entryId: scheduleId,
    dependencies: [roleState.entryId, functionState.entryId],
    parameters: {
      ...parameters,
      scheduleName
    }
  });
};

export const getSchedule = <E extends EntryState>(state: EntryStates<E>, scheduleName: string) => {
  const scheduleId = hashData(toKebabCase(scheduleName));
  const scheduleState = state[scheduleId];

  if (scheduleState && isSchedule(scheduleState)) {
    return scheduleState;
  }

  return null;
};
