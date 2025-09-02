import type { EmulatorServiceRequest, ServeOptions } from '@ez4/project/library';
import type { Client as StorageClient } from '@ez4/storage';
import type { BucketService } from '@ez4/storage/library';

import { getServiceName } from '@ez4/project/library';

import { createServiceClient } from '../client/service';

export const registerBucketEmulator = (service: BucketService, options: ServeOptions) => {
  const client = createServiceClient(service.name, options);

  return {
    type: 'Storage',
    name: service.name,
    identifier: getServiceName(service.name, options),
    clientHandler: () => {
      return createServiceClient(service.name, options);
    },
    requestHandler: (request: EmulatorServiceRequest) => {
      return handleRequest(client, request);
    }
  };
};

const handleRequest = async (client: StorageClient, request: EmulatorServiceRequest) => {
  const { method, path, body } = request;

  if (!path || path === '/') {
    throw new Error(`File path wasn't given.`);
  }

  switch (method) {
    case 'GET':
      return loadFile(client, path);

    case 'PUT': {
      if (!body) {
        throw new Error("File content wasn't given.");
      }

      return storeFile(client, path, body);
    }

    default:
      throw new Error('Unsupported storage request.');
  }
};

const loadFile = async (client: StorageClient, path: string) => {
  const [buffer, stat] = await Promise.all([client.read(path), client.getStats(path)]);

  return {
    status: 200,
    body: buffer,
    headers: {
      ['content-type']: stat
    }
  };
};

const storeFile = async (client: StorageClient, path: string, buffer: Buffer) => {
  await client.write(path, buffer);

  return {
    status: 204
  };
};
