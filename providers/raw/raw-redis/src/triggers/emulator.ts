import type { EmulateClientEvent, EmulateServiceEvent } from '@ez4/project/library';

import { getConnectionOptions } from '../local/options';
import { Client } from '../client/service';
import { getCacheName, getKeyPrefix, isRawRedisService } from './utils';

export const createEmulatorClient = (event: EmulateClientEvent) => {
  const { service, options } = event;

  if (!isRawRedisService(service)) {
    return null;
  }

  const instance = Client.make({
    identifier: getCacheName(service, options),
    prefix: getKeyPrefix(service, options),
    connection: getConnectionOptions(service, options),
    debug: options.debug
  });

  return {
    make: () => instance
  };
};

export const resetEmulatorService = async (event: EmulateServiceEvent) => {
  const { service, options } = event;

  if (!isRawRedisService(service)) {
    return;
  }

  // Only the keys of this service are removed (see `flush`).
  const client = Client.make({
    identifier: getCacheName(service, options),
    prefix: getKeyPrefix(service, options),
    connection: getConnectionOptions(service, options),
    debug: options.debug
  });

  await client.flush();
};

export const stopEmulatorService = (event: EmulateServiceEvent) => {
  const { service, options } = event;

  if (isRawRedisService(service)) {
    Client.dispose(getCacheName(service, options));
  }
};
