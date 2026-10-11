import type { EmulateDescriptorEvent, EmulateServiceEvent, EmulatorServiceDescriptor } from '@ez4/project/library';
import type { CacheService } from '@ez4/cache/library';
import type { ClientContext } from '../client/service';

import { importCache } from '../cache/client';
import { getConnectionOptions } from '../local/options';
import { RemoteCacheNotFoundError } from '../cache/errors';
import { deleteAllKeys } from '../local/keys';
import { Client } from '../client';
import { getCacheName, isValkeyService } from './utils';

export const prepareEmulatorDescriptor = async (event: EmulateDescriptorEvent): Promise<EmulatorServiceDescriptor | null> => {
  const { service, options } = event;

  if (!isValkeyService(service)) {
    return null;
  }

  return {
    module: '@ez4/aws-valkey/worker',
    name: 'makeService',
    options: await getClientOptions(service, options)
  };
};

const getClientOptions = async (service: CacheService, options: EmulateDescriptorEvent['options']): Promise<ClientContext> => {
  const cacheName = getCacheName(service, options);

  if (options.local) {
    const connection = getConnectionOptions(service, options);

    return {
      identifier: cacheName,
      debug: options.debug,
      connection: {
        endpoint: connection.endpoint,
        port: connection.port,
        tls: false
      }
    };
  }

  const cacheData = await importCache(undefined, cacheName);

  if (!cacheData) {
    throw new RemoteCacheNotFoundError(service.name);
  }

  return {
    identifier: cacheName,
    debug: options.debug,
    connection: {
      endpoint: cacheData.writerEndpoint
    }
  };
};

export const resetEmulatorService = async (event: EmulateServiceEvent) => {
  const { service, options } = event;

  if (isValkeyService(service) && options.local) {
    const connection = getConnectionOptions(service, options);

    await deleteAllKeys(connection);
  }
};

export const stopEmulatorService = (event: EmulateServiceEvent) => {
  const { service, options } = event;
  if (!isValkeyService(service)) {
    return null;
  }

  const cacheName = getCacheName(service, options);

  return Client.dispose(cacheName);
};
