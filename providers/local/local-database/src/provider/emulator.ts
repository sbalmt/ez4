import type { DatabaseService } from '@ez4/database/library';
import type { ServeOptions } from '@ez4/project/library';

import { getServiceName, triggerAllAsync } from '@ez4/project/library';
import { getDatabaseName, getTablesRepository } from '@ez4/pgclient/library';
import { Client } from '@ez4/pgclient';

export const registerDatabaseEmulator = async (service: DatabaseService, options: ServeOptions) => {
  const client = await createDatabaseClient(service, options);

  return {
    type: 'Database',
    name: service.name,
    identifier: getServiceName(service.name, options),
    clientHandler: () => {
      return client;
    }
  };
};

const createDatabaseClient = async (service: DatabaseService, options: ServeOptions) => {
  const providerOptions = options.providerOptions[service.engine.name];

  switch (providerOptions?.mode) {
    default:
      throw new Error(`Malformed provider options.`);

    case 'remote':
      return triggerAllAsync('emulator:getClient', (handler) =>
        handler({
          service,
          options
        })
      );

    case 'local': {
      const { user, password, database, host } = providerOptions;

      const repository = getTablesRepository(service.tables);

      return Client.make({
        debug: options.debug,
        repository,
        connection: {
          database: database ?? getDatabaseName(service, options),
          host: host ?? '127.0.0.1',
          password,
          user
        }
      });
    }
  }
};
