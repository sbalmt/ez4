import { registerProvider } from '@ez4/aws-common';

import { getQueueHandler } from './queue/handler.js';
import { QueueServiceType } from './queue/types.js';

export * from './queue/service.js';
export * from './queue/types.js';
export * from './queue/utils.js';

export * from './function/service.js';
export * from './function/types.js';

export * from './mapping/service.js';
export * from './mapping/types.js';

export * from './triggers/register.js';

registerProvider(QueueServiceType, getQueueHandler());
