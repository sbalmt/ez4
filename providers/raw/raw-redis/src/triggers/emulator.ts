import type { EmulateDescriptorEvent, EmulateServiceEvent, EmulatorServiceDescriptor } from '@ez4/project/library';

import { getConnectionOptions } from '../local/options';
import { Client } from '../client/service';
import { getCacheName, getKeyPrefix, isRawRedisService } from './utils';

export const prepareEmulatorDescriptor = (event: EmulateDescriptorEvent): EmulatorServiceDescriptor | null => {
  const { service, options } = event;

  if (!isRawRedisService(service)) {
    return null;
  }

  return {
    module: '@ez4/raw-redis/worker',
    name: 'makeService',
    options: {
      identifier: getCacheName(service, options),
      prefix: getKeyPrefix(service, options),
      connection: getConnectionOptions(service, options),
      debug: options.debug
    }
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

  try {
    await client.flush();
  } finally {
    Client.dispose(getCacheName(service, options));
  }
};

export const stopEmulatorService = (event: EmulateServiceEvent) => {
  const { service, options } = event;

  if (isRawRedisService(service)) {
    Client.dispose(getCacheName(service, options));
  }
};
