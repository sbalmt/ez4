import type { DatabaseService } from '@ez4/database/library';
import type { ServeOptions } from '@ez4/project/library';

import { getTableRepository } from '@ez4/pgclient/library';
import { getServiceName, triggerAllAsync } from '@ez4/project/library';
import { Client } from '@ez4/pgclient';

import { ensureDatabase, ensureMigration } from '../service/migration';
import { getConnectionOptions } from '../utils/options';

export const registerDatabaseEmulator = async (service: DatabaseService, options: ServeOptions) => {
  const client = await getDatabaseClient(service, options);

  return {
    type: 'Database',
    name: service.name,
    identifier: getServiceName(service.name, options),
    bootstrapHandler: () => {
      return runDatabaseMigration(service, options);
    },
    clientHandler: () => {
      return client;
    }
  };
};

const runDatabaseMigration = async (service: DatabaseService, options: ServeOptions) => {
  const connection = options.local ? getConnectionOptions(service, options) : undefined;

  if (connection) {
    const repository = getTableRepository(service.tables);

    await ensureDatabase(connection);

    await ensureMigration(connection, repository, options.force);
  }
};

const getDatabaseClient = async (service: DatabaseService, options: ServeOptions) => {
  const connection = options.local ? getConnectionOptions(service, options) : undefined;

  if (connection) {
    const repository = getTableRepository(service.tables);

    return Client.make({
      debug: options.debug,
      connection,
      repository
    });
  }

  return triggerAllAsync('emulator:getClient', (handler) =>
    handler({
      service,
      options
    })
  );
};
