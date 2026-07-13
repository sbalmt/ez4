import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { QueueService } from '@ez4/queue/library';

import { triggerAllAsync } from '@ez4/project/library';

import { registerLocalService } from './local';

export const registerQueueEmulator = async (service: QueueService, options: ServeOptions, context: EmulateServiceContext) => {
  const externalClient = await getExternalClient(service, options);

  if (externalClient) {
    return null;
  }

  return registerLocalService(service, options, context);
};

const getExternalClient = (service: QueueService, options: ServeOptions) => {
  return triggerAllAsync('emulator:clientFactory', (handler) => handler({ service, options }));
};
