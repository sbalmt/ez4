import { registerProvider } from '@ez4/aws-common';

import { getScheduleHandler } from './handler';
import { ScheduleServiceType } from './types';

export const registerScheduleProvider = () => {
  registerProvider(ScheduleServiceType, getScheduleHandler());
};
