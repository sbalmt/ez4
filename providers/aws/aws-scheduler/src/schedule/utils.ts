import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { EntryState } from '@ez4/stateful';
import type { ScheduleState } from './types.js';

import { hashData, toKebabCase } from '@ez4/utils';

import { ScheduleNotFoundError } from './errors.js';
import { ScheduleServiceType } from './types.js';

export const createScheduleStateId = (scheduleName: string) => {
  return hashData(ScheduleServiceType, toKebabCase(scheduleName));
};

export const isScheduleState = (resource: EntryState): resource is ScheduleState => {
  return resource.type === ScheduleServiceType;
};

export const getScheduleState = (context: EventContext, scheduleName: string, options: DeployOptions) => {
  const scheduleState = context.getServiceState(scheduleName, options);

  if (!isScheduleState(scheduleState)) {
    throw new ScheduleNotFoundError(scheduleName);
  }

  return scheduleState;
};
