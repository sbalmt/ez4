import type { EmulateServiceContext, ServeOptions, ServiceEmulator } from '@ez4/project/library';
import type { DatabaseService } from '@ez4/database/library';

import { getServiceName, triggerAllAsync } from '@ez4/project/library';
import { Logger } from '@ez4/logger';

export const registerDatabaseEmulator = async (
  service: DatabaseService,
  options: ServeOptions,
  context: EmulateServiceContext
): Promise<ServiceEmulator | null> => {
  const descriptor = await getDatabaseDescriptor(service, options);

  if (!descriptor) {
    return null;
  }

  return {
    type: 'Database',
    name: service.name,
    options: service.options,
    identifier: getServiceName(service.name, options),
    prepareHandler: () => {
      return runDatabaseReset(service, options, context);
    },
    bootstrapHandler: async () => {
      await runDatabaseMigration(service, options, context);
    },
    exportDescriptor: (serviceOptions) => {
      const descriptorOptions = descriptor.options ?? {};

      if ('defaults' in descriptorOptions) {
        return {
          ...descriptor,
          options: {
            ...descriptorOptions,
            defaults: {
              ...descriptorOptions.defaults,
              ...serviceOptions
            }
          }
        };
      }

      return {
        ...descriptor,
        options: {
          ...descriptorOptions,
          serviceOptions
        }
      };
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

const getDatabaseDescriptor = (service: DatabaseService, options: ServeOptions) => {
  return triggerAllAsync('emulator:serviceDescriptor', (handler) => handler({ service, options }));
};
