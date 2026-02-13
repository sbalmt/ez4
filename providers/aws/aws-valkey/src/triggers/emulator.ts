import type { EmulateClientEvent, EmulateServiceEvent } from '@ez4/project/library';

import { importCache } from '../cache/client';
import { getConnectionOptions } from '../local/options';
import { CacheNotFoundError } from '../cache/errors';
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

    return Client.make({
      identifier: cacheName,
      debug: options.debug,
      connection: {
        endpoint: connection.endpoint,
        port: connection.port,
        tls: false
      }
    });
  }

  const cacheData = await importCache(undefined, cacheName);

  if (!cacheData) {
    throw new CacheNotFoundError(service.name);
  }

  return Client.make({
    identifier: cacheName,
    debug: options.debug,
    connection: {
      endpoint: cacheData.writerEndpoint
    }
  });
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
