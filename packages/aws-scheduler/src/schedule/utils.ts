import type { EntryState } from '@ez4/stateful';
import type { ScheduleState } from './types.js';

import { hashData, toKebabCase } from '@ez4/utils';

import { ScheduleServiceType } from './types.js';

export const isScheduleState = (resource: EntryState): resource is ScheduleState => {
  return resource.type === ScheduleServiceType;
};

export const getScheduleStateId = (scheduleName: string) => {
  return hashData(ScheduleServiceType, toKebabCase(scheduleName));
};
