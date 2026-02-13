import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { CacheService } from '@ez4/cache/library';

import { getServiceName, triggerAllAsync } from '@ez4/project/library';
import { Logger } from '@ez4/logger';

export const registerCacheEmulator = async (service: CacheService, options: ServeOptions, context: EmulateServiceContext) => {
  const client = await getCacheClient(service, options);

  if (!client) {
    return null;
  }

  return {
    type: 'Cache',
    name: service.name,
    identifier: getServiceName(service.name, options),
    prepareHandler: () => {
      return runCacheReset(service, options, context);
    },
    bootstrapHandler: async () => {
      await runStartCache(service, options, context);
    },
    shutdownHandler: async () => {
      await runStopCache(service, options, context);
    },
    exportHandler: () => {
      return client;
    }
  };
};

const runCacheReset = async (service: CacheService, options: ServeOptions, context: EmulateServiceContext) => {
  if (options.local && options.reset) {
    Logger.warn(`Cache service ${service.name} was reset.`);

    await triggerAllAsync('emulator:resetService', (handler) =>
      handler({
        service,
        options,
        context
      })
    );
  }
};

const runStartCache = (service: CacheService, options: ServeOptions, context: EmulateServiceContext) => {
  return triggerAllAsync('emulator:startService', (handler) =>
    handler({
      service,
      options,
      context
    })
  );
};

const runStopCache = (service: CacheService, options: ServeOptions, context: EmulateServiceContext) => {
  return triggerAllAsync('emulator:stopService', (handler) =>
    handler({
      service,
      options,
      context
    })
  );
};

const getCacheClient = (service: CacheService, options: ServeOptions) => {
  return triggerAllAsync('emulator:getClient', (handler) =>
    handler({
      service,
      options
    })
  );
};
