import { registerProvider } from '@ez4/aws-common';

import { getQueueHandler } from './handler.js';
import { QueueServiceType } from './types.js';

export const registerQueueProvider = () => {
  registerProvider(QueueServiceType, getQueueHandler());
};
