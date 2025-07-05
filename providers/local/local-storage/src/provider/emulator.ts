import type { EmulatorServiceRequest, ServeOptions } from '@ez4/project/library';
import type { Client as StorageClient } from '@ez4/storage';
import type { BucketService } from '@ez4/storage/library';

import { getServiceName, Logger } from '@ez4/project/library';

import { createStorageClient } from '../service/client.js';

export const registerBucketEmulator = (service: BucketService, options: ServeOptions) => {
  const client = createStorageClient(service.name, options);

  return {
    type: 'Storage',
    name: service.name,
    identifier: getServiceName(service.name, options),
    clientHandler: () => {
      return createStorageClient(service.name, options);
    },
    requestHandler: (request: EmulatorServiceRequest) => {
      return handleRequest(client, request);
    }
  };
};

const handleRequest = async (client: StorageClient, request: EmulatorServiceRequest) => {
  if (!request.path || request.path === '/') {
    throw new Error(`File path wasn\'t given.`);
  }

  switch (request.method) {
    case 'GET':
      return loadFile(client, request.path);

    case 'PUT': {
      if (!request.body) {
        throw new Error("File content wasn't given.");
      }

      return storeFile(client, request.path, request.body);
    }

    default:
      throw new Error('Unsupported storage request.');
  }
};

const loadFile = async (client: StorageClient, path: string) => {
  const [buffer, stat] = await Promise.all([client.read(path), client.getStats(path)]);

  Logger.log(`File downloaded from ${path}`);

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

  Logger.log(`File uploaded to ${path}`);

  return {
    status: 204
  };
};
