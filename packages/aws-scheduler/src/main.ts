import { registerProvider } from '@ez4/aws-common';

import { getScheduleHandler } from './schedule/handler.js';
import { ScheduleServiceType } from './schedule/types.js';

export * from './schedule/function/service.js';
export * from './schedule/function/types.js';

export * from './schedule/service.js';
export * from './schedule/types.js';

export * from './triggers/register.js';

registerProvider(ScheduleServiceType, getScheduleHandler());
