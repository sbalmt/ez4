import type { PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';

import { getDatabaseName, getTableRepository } from '@ez4/pgclient/library';

import { MissingConnectionStringError } from './errors';
import { getConnectionEnvName, isRawPgService } from './utils';

export const prepareDatabaseServices = (event: PrepareResourceEvent) => {
  const { service } = event;

  if (!isRawPgService(service)) {
    return false;
  }

  // No AWS resource to create — external Postgres is operator-managed.
  // Validate that the operator has provided a connection string at deploy time.
  const envName = getConnectionEnvName(service);

  if (!process.env[envName]) {
    throw new MissingConnectionStringError(envName, service.name);
  }

  return true;
};

export const prepareLinkedServices = (event: ServiceEvent) => {
  const { service, options } = event;

  if (!isRawPgService(service)) {
    return null;
  }

  const envName = getConnectionEnvName(service);
  const connectionString = process.env[envName];

  if (!connectionString) {
    throw new MissingConnectionStringError(envName, service.name);
  }

  const database = getDatabaseName(service, options);
  const repository = getTableRepository(service.tables);

  return {
    from: '@ez4/raw-pg/client',
    module: 'Client',
    constructor:
      `@{EZ4_MODULE_IMPORT}.make({` +
      `connection: { database: "${database}", connectionString: process.env.${envName} }, ` +
      `repository: ${JSON.stringify(repository)}, ` +
      `debug: ${options.debug ?? false}` +
      `})`,
    variables: {
      [envName]: connectionString
    }
  };
};
