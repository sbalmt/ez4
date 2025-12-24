import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { DatabaseService } from '@ez4/database/library';

import { getServiceName, Logger, triggerAllAsync } from '@ez4/project/library';

export const registerDatabaseEmulator = async (service: DatabaseService, options: ServeOptions, context: EmulateServiceContext) => {
  const client = await getDatabaseClient(service, options);

  if (!client) {
    return null;
  }

  return {
    type: 'Database',
    name: service.name,
    identifier: getServiceName(service.name, options),
    prepareHandler: () => {
      return runDatabaseReset(service, options, context);
    },
    bootstrapHandler: async () => {
      await runDatabaseMigration(service, options, context);
    },
    exportHandler: () => {
      return client;
    }
  };
};

const runDatabaseReset = async (service: DatabaseService, options: ServeOptions, context: EmulateServiceContext) => {
  if (options.local && options.reset) {
    Logger.warn(`Database service ${service.name} was reset.`);

    await triggerAllAsync('emulator:resetService', (handler) =>
      handler({
        service,
        options,
        context
      })
    );
  }
};

const runDatabaseMigration = (service: DatabaseService, options: ServeOptions, context: EmulateServiceContext) => {
  return triggerAllAsync('emulator:startService', (handler) =>
    handler({
      service,
      options,
      context
    })
  );
};

const getDatabaseClient = (service: DatabaseService, options: ServeOptions) => {
  return triggerAllAsync('emulator:getClient', (handler) =>
    handler({
      service,
      options
    })
  );
};
