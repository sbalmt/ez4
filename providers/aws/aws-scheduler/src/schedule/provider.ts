import { registerProvider } from '@ez4/aws-common';

import { getScheduleHandler } from './handler.js';
import { ScheduleServiceType } from './types.js';

export const registerScheduleProvider = () => {
  registerProvider(ScheduleServiceType, getScheduleHandler());
};
