import { tryRegisterProvider } from '@ez4/aws-common';

import { getScheduleHandler } from './handler';
import { ScheduleServiceType } from './types';

export const registerScheduleProvider = () => {
  tryRegisterProvider(ScheduleServiceType, getScheduleHandler());
};
