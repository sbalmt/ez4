import type { EmulateServiceContext, EmulatorRequestEvent, ServeOptions } from '@ez4/project/library';
import type { QueueService } from '@ez4/queue/library';
import type { AnyObject } from '@ez4/utils';

import { getServiceName, triggerAllAsync } from '@ez4/project/library';

import { createLocalClient } from '../client/local';
import { handleQueueMessage, handleQueueRequest } from './local';

export const registerQueueEmulator = async (service: QueueService, options: ServeOptions, context: EmulateServiceContext) => {
  const { name: resourceName, schema: messageSchema } = service;

  const externalClient = await getExternalClient(service, options);

  if (externalClient) {
    return null;
  }

  const clientOptions = {
    ...options,
    delay: service.delay ?? 0,
    handler: (message: AnyObject) => {
      return handleQueueMessage(service, options, context, message);
    }
  };

  return {
    type: 'Queue',
    name: resourceName,
    identifier: getServiceName(resourceName, options),
    exportHandler: () => {
      return createLocalClient(resourceName, messageSchema, clientOptions);
    },
    requestHandler: (request: EmulatorRequestEvent) => {
      return handleQueueRequest(service, options, context, request);
    }
  };
};

const getExternalClient = (service: QueueService, options: ServeOptions) => {
  return triggerAllAsync('emulator:getClient', (handler) => handler({ service, options }));
};
