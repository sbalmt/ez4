import { registerProvider } from '@ez4/aws-common';

import { getQueueHandler } from './handler';
import { QueueServiceType } from './types';

export const registerQueueProvider = () => {
  registerProvider(QueueServiceType, getQueueHandler());
};
