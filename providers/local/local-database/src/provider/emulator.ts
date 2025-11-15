import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { DatabaseService } from '@ez4/database/library';

import { getServiceName, triggerAllAsync } from '@ez4/project/library';

export const registerDatabaseEmulator = async (service: DatabaseService, options: ServeOptions, context: EmulateServiceContext) => {
  const client = await getDatabaseClient(service, options);

  if (!client) {
    return null;
  }

  return {
    type: 'Database',
    name: service.name,
    identifier: getServiceName(service.name, options),
    bootstrapHandler: () => {
      return runDatabaseMigration(service, options, context);
    },
    clientHandler: () => {
      return client;
    }
  };
};

const runDatabaseMigration = async (service: DatabaseService, options: ServeOptions, context: EmulateServiceContext) => {
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
