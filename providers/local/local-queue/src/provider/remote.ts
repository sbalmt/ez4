import type { ServeOptions } from '@ez4/project/library';
import type { QueueImport } from '@ez4/queue/library';
import type { HttpProviderRequest } from '@ez4/server';
import type { RemoteClientOptions } from '../client/remote';

import { getServiceName, MissingImportedProjectError } from '@ez4/project/library';
import { ProviderType, registerProvider as registerServerProvider, unregisterProvider as unregisterServerProvider } from '@ez4/server';

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
          return handleQueueForward(service, clientOptions, request);
        }
      });
    },
    shutdownHandler: () => {
      unregisterServerProvider(identifier);
    }
  };
};

const handleQueueForward = (service: QueueImport, options: RemoteClientOptions, request: HttpProviderRequest) => {
  const { reference: referenceName, schema: messageSchema } = service;

  const client = createRemoteClient(referenceName, messageSchema, options);

  return client.sendMessage(JSON.parse(request.body!.toString()));
};
