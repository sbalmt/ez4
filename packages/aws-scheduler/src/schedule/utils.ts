import type { EntryState } from '@ez4/stateful';
import type { ScheduleState } from './types.js';

import { ScheduleServiceType } from './types.js';

export const isScheduleState = (resource: EntryState): resource is ScheduleState => {
  return resource.type === ScheduleServiceType;
};
