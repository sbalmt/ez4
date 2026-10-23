import type { ServeOptions } from '@ez4/project/library';
import type { QueueImport } from '@ez4/queue/library';
import type { HttpProviderRequest } from '@ez4/server';
import type { AnyObject } from '@ez4/utils';
import type { RemoteClientOptions } from '../client/remote';

import { getServiceName, MissingImportedProjectError } from '@ez4/project/library';
import {
  getSuccessResponse,
  ProviderType,
  registerProvider as registerServerProvider,
  unregisterProvider as unregisterServerProvider
} from '@ez4/server';
import { Logger } from '@ez4/logger';

import { createRemoteClient } from '../client/remote';

export const registerRemoteService = (service: QueueImport, options: ServeOptions) => {
  const { name: resourceName, reference: referenceName, schema: messageSchema, project } = service;
  const { imports } = options;

  if (!imports || !imports[project]) {
    throw new MissingImportedProjectError(project);
  }

  const identifier = getServiceName(resourceName, options);

  const clientOptions = {
    ...imports[project]
  };

  return {
    type: 'Queue',
    name: resourceName,
    options: service.options,
    identifier,
    exportDescriptor: () => ({
      name: 'makeRemoteService',
      module: '@ez4/local-queue/worker',
      options: {
        resourceName: referenceName,
        schema: messageSchema,
        clientOptions
      }
    }),
    bootstrapHandler: () => {
      registerServerProvider(identifier, {
        type: ProviderType.Http,
        requestHandler: (request) => {
          return handleQueueRequest(service, clientOptions, request);
        }
      });
    },
    shutdownHandler: () => {
      unregisterServerProvider(identifier);
    }
  };
};

const handleQueueRequest = (service: QueueImport, options: RemoteClientOptions, request: HttpProviderRequest) => {
  const { method, path, body } = request;

  if (method !== 'POST' || path !== '/' || !body) {
    throw new Error('Unsupported queue request.');
  }

  const jsonMessage = JSON.parse(body.toString());

  setImmediate(() => handleQueueForward(service, options, jsonMessage));

  return getSuccessResponse(201);
};

const handleQueueForward = async (service: QueueImport, options: RemoteClientOptions, message: AnyObject) => {
  const { reference: referenceName, schema: messageSchema } = service;

  try {
    const client = createRemoteClient(referenceName, messageSchema, options);

    await client.sendMessage(message);
  } catch (error) {
    Logger.error(`Queue [${service.name}] failed to forward message:`);
    Logger.error(`  ${error}`);
  }
};
