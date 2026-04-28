import type { EmulateServiceContext, EmulatorRequestEvent, ServeOptions } from '@ez4/project/library';
import type { Client as StorageClient } from '@ez4/storage';
import type { BucketService } from '@ez4/storage/library';

import { getServiceName, triggerAllAsync } from '@ez4/project/library';
import { Logger } from '@ez4/logger';

import { processLambdaEvent } from '../handlers/lambda';
import { createLocalClient } from '../client/local';

export const registerBucketEmulator = async (service: BucketService, options: ServeOptions, context: EmulateServiceContext) => {
  const client = await getStorageClient(service, options, context);

  const { name: resourceName } = service;

  return {
    type: 'Storage',
    name: resourceName,
    identifier: getServiceName(resourceName, options),
    bootstrapHandler: () => {
      Logger.log(`📂 ${options.local ? 'Local' : 'Remote'} storage [${resourceName}] in use.`);
    },
    requestHandler: (request: EmulatorRequestEvent) => {
      return handleRequest(client, request);
    },
    exportHandler: () => {
      return client;
    }
  };
};

const getStorageClient = async (service: BucketService, options: ServeOptions, context: EmulateServiceContext) => {
  const client = await triggerAllAsync('emulator:getClient', (handler) => handler({ service, options }));

  if (!client) {
    const { events } = service;

    return createLocalClient(service.name, {
      ...options,
      events: events?.map((event) => {
        const [prefix, suffix] = event.path.split('*', 2);

        return {
          prefix,
          suffix,
          handler: (input) => {
            return processLambdaEvent(service, options, context, event, input);
          }
        };
      })
    });
  }

  return client as StorageClient;
};

const handleRequest = async (client: StorageClient, request: EmulatorRequestEvent) => {
  const { method, path, body } = request;

  if (!path || path === '/') {
    throw new Error(`File path wasn't given.`);
  }

  switch (method) {
    case 'HEAD':
      return headFile(client, path);

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
  const [buffer, stat] = await Promise.all([client.read(path), client.stat(path)]);

  return {
    status: 200,
    body: buffer,
    headers: {
      ['content-type']: stat?.type ?? 'application/octet-stream'
    }
  };
};

const storeFile = async (client: StorageClient, path: string, buffer: Buffer) => {
  await client.write(path, buffer);

  return {
    status: 204
  };
};

const headFile = async (client: StorageClient, path: string) => {
  const stat = await client.stat(path);

  if (!stat) {
    return {
      status: 404
    };
  }

  return {
    status: 200,
    headers: {
      ['content-length']: stat.size.toString(),
      ['content-type']: stat.type
    }
  };
};
