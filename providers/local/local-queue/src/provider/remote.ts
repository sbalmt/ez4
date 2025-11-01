import type { EmulatorServiceRequest, ServeOptions } from '@ez4/project/library';
import type { QueueImport } from '@ez4/queue/library';
import type { RemoteClientOptions } from '../client/remote';

import { getServiceName, MissingImportedProjectError } from '@ez4/project/library';

import { createRemoteClient } from '../client/remote';

export const registerRemoteServices = (service: QueueImport, options: ServeOptions) => {
  const { name: serviceName, reference: referenceName, schema: messageSchema, project } = service;
  const { imports } = options;

  if (!imports || !imports[project]) {
    throw new MissingImportedProjectError(project);
  }

  const clientOptions = {
    ...imports[project]
  };

  return {
    type: 'Queue',
    name: serviceName,
    identifier: getServiceName(serviceName, options),
    clientHandler: () => {
      return createRemoteClient(referenceName, messageSchema, clientOptions);
    },
    requestHandler: (request: EmulatorServiceRequest) => {
      return handleQueueForward(service, clientOptions, request);
    }
  };
};

const handleQueueForward = async (service: QueueImport, options: RemoteClientOptions, request: EmulatorServiceRequest) => {
  const { reference: referenceName, schema: messageSchema } = service;

  const client = createRemoteClient(referenceName, messageSchema, options);

  return client.sendMessage(JSON.parse(request.body!.toString()));
};
