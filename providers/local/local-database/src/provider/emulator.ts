import type { EmulateServiceContext, ServeOptions, ServiceEmulator } from '@ez4/project/library';
import type { DatabaseService } from '@ez4/database/library';

import { getServiceName, triggerAllAsync } from '@ez4/project/library';
import { Logger } from '@ez4/logger';

export const registerDatabaseEmulator = async (
  service: DatabaseService,
  options: ServeOptions,
  context: EmulateServiceContext
): Promise<ServiceEmulator | null> => {
  const clientFactory = await getDatabaseClient(service, options);

  if (!clientFactory) {
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
    exportHandler: (serviceOptions) => {
      return clientFactory.make(serviceOptions);
    }
  };
};

const runDatabaseReset = async (service: DatabaseService, options: ServeOptions, context: EmulateServiceContext) => {
  if (options.local && options.reset) {
    await triggerAllAsync('emulator:resetService', (handler) => handler({ service, options, context }));

    Logger.warn(`Database service ${service.name} was reset.`);
  }
};

const runDatabaseMigration = (service: DatabaseService, options: ServeOptions, context: EmulateServiceContext) => {
  return triggerAllAsync('emulator:startService', (handler) => handler({ service, options, context }));
};

const getDatabaseClient = (service: DatabaseService, options: ServeOptions) => {
  return triggerAllAsync('emulator:clientFactory', (handler) => handler({ service, options }));
};
