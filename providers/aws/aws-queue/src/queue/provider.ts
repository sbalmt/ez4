import { tryRegisterProvider } from '@ez4/aws-common';

import { getQueueHandler } from './handler';
import { QueueServiceType } from './types';

export const registerQueueProvider = () => {
  tryRegisterProvider(QueueServiceType, getQueueHandler());
};
