import type { EmulateClientEvent, EmulateServiceEvent } from '@ez4/project/library';

import { importCache } from '../cache/client';
import { getConnectionOptions } from '../local/options';
import { RemoteCacheNotFoundError } from '../cache/errors';
import { deleteAllKeys } from '../local/keys';
import { Client } from '../client';
import { getCacheName, isValkeyService } from './utils';

export const createEmulatorClient = async (event: EmulateClientEvent) => {
  const { service, options } = event;

  if (!isValkeyService(service)) {
    return null;
  }

  const cacheName = getCacheName(service, options);

  if (options.local) {
    const connection = getConnectionOptions(service, options);

    const instance = Client.make({
      identifier: cacheName,
      debug: options.debug,
      connection: {
        endpoint: connection.endpoint,
        port: connection.port,
        tls: false
      }
    });

    return {
      make: () => instance
    };
  }

  const cacheData = await importCache(undefined, cacheName);

  if (!cacheData) {
    throw new RemoteCacheNotFoundError(service.name);
  }

  const instance = Client.make({
    identifier: cacheName,
    debug: options.debug,
    connection: {
      endpoint: cacheData.writerEndpoint
    }
  });

  return {
    make: () => instance
  };
};

export const resetEmulatorService = async (event: EmulateServiceEvent) => {
  const { service, options } = event;

  if (isValkeyService(service) && options.local) {
    const connection = getConnectionOptions(service, options);

    await deleteAllKeys(connection);
  }
};

export const stopEmulatorService = (event: EmulateClientEvent) => {
  const { service, options } = event;
  if (!isValkeyService(service)) {
    return null;
  }

  const cacheName = getCacheName(service, options);

  return Client.dispose(cacheName);
};
