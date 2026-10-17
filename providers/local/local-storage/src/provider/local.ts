import type { EmulateServiceContext, EmulatorRequestEvent, ServeOptions, ServiceEmulator } from '@ez4/project/library';
import type { Bucket, Client as StorageClient } from '@ez4/storage';
import type { AnyServiceDescriptor } from '@ez4/emulator';
import type { BucketService } from '@ez4/storage/library';

import { getServiceName, triggerAllAsync } from '@ez4/project/library';
import { loadService, notifyProvider, registerProvider, unregisterProvider } from '@ez4/emulator';
import { BucketEventType } from '@ez4/storage';
import { Logger } from '@ez4/logger';

import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

import { processLambdaEvent } from '../handlers/lambda';
import { BucketManifest } from '../service/manifest';
import { ProviderEvent } from '../types/events';

export const registerLocalService = async (
  service: BucketService,
  options: ServeOptions,
  context: EmulateServiceContext
): Promise<ServiceEmulator | null> => {
  const { name: resourceName } = service;

  const identifier = getServiceName(resourceName, options);
  const directory = join('.ez4', identifier);
  const provider = `storage:${identifier}`;

  const descriptor = await getStorageDescriptor(service, options);

  if (!descriptor) {
    return null;
  }

  const client = await makeService(descriptor);

  return {
    type: 'Storage',
    name: resourceName,
    options: service.options,
    identifier,
    bootstrapHandler: async () => {
      if (!options.local) {
        Logger.log(`📂 Remote storage [${resourceName}] in use.`);
      } else {
        Logger.log(`📂 Local storage [${resourceName}] in use.`);

        await mkdir(directory, { recursive: true });

        registerProvider(provider, {
          eventTypes: [ProviderEvent.CreateFile, ProviderEvent.DeleteFile],
          eventHandler: (_event: string, payload: Bucket.Incoming | undefined) => {
            if (!payload) {
              throw new Error('Missing storage event payload.');
            }

            return handleStorageEvent(service, options, context, payload);
          }
        });
      }
    },
    shutdownHandler: () => {
      if (options.local) {
        unregisterProvider(provider);
      }
    },
    requestHandler: (request: EmulatorRequestEvent) => {
      return handleRequest(client, request);
    },
    exportDescriptor: () => descriptor,
    manifestHandler: () => {
      return BucketManifest.build(service);
    }
  };
};

const getStorageDescriptor = (service: BucketService, options: ServeOptions) => {
  if (!options.local) {
    return triggerAllAsync('emulator:serviceDescriptor', (handler) => handler({ service, options }));
  }

  const identifier = getServiceName(service.name, options);

  return {
    name: 'makeService',
    module: '@ez4/local-storage/worker',
    provider: `storage:${identifier}`,
    options: {
      host: options.serviceHost,
      identifier,
      directory: join('.ez4', identifier)
    }
  };
};

const makeService = async (descriptor: AnyServiceDescriptor) => {
  const factory = await loadService<() => StorageClient>({}, descriptor, (provider) => ({
    notify: (event, payload) => {
      notifyProvider(provider, event, payload).catch((error: unknown) => {
        Logger.error(error instanceof Error ? (error.stack ?? error.message) : String(error));
      });
    },
    request: (event, payload) => notifyProvider(provider, event, payload)
  }));

  return factory();
};

const handleStorageEvent = async (
  service: BucketService,
  options: ServeOptions,
  context: EmulateServiceContext,
  input: Bucket.ObjectEvent
) => {
  await Promise.all(
    service.events
      ?.filter((event) => {
        const [prefix, suffix] = event.path.split('*', 2);
        const triggers = event.triggers ?? [BucketEventType.Create, BucketEventType.Delete];

        return triggers.includes(input.eventType) && input.objectKey.startsWith(prefix) && input.objectKey.endsWith(suffix);
      })
      .map((event) => processLambdaEvent(service, options, context, event, input)) ?? []
  );
};

const handleRequest = async (client: StorageClient, request: EmulatorRequestEvent) => {
  const { method, path, body } = request;

  if (!path || path === '/') {
    throw new Error(`File path wasn't given.`);
  }

  const key = path.startsWith('/') ? path.slice(1) : path;

  switch (method) {
    case 'HEAD':
      return headFile(client, key);

    case 'GET':
      return loadFile(client, key);

    case 'POST':
    case 'PUT': {
      if (!body) {
        throw new Error("File content wasn't given.");
      }

      return storeFile(client, key, body);
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
