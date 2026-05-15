import type { DatabaseService } from '@ez4/database/library';
import type { ServeOptions } from '@ez4/project/library';
import type { ClientConnection } from '@ez4/pgclient';

import { getDatabaseName } from '@ez4/pgclient/library';
import { isEmptyObject, toSnakeCase } from '@ez4/utils';

import { IncompleteConnectionError, LocalOptionsNotFoundError } from './errors';

export const getConnectionOptions = (service: DatabaseService, options: ServeOptions): ClientConnection => {
  const optionsName = toSnakeCase(service.name);

  const serviceOptions = {
    ...options.localOptions[optionsName],
    ...(options.test && options.testOptions[optionsName])
  };

  if (isEmptyObject(serviceOptions)) {
    throw new LocalOptionsNotFoundError(optionsName, service.name);
  }

  const { connectionString, user, password, host, port, database, ssl } = serviceOptions;

  const resolvedDatabase = database ?? getDatabaseName(service, options);

  if (connectionString) {
    return {
      database: resolvedDatabase,
      connectionString,
      ssl
    };
  }

  if (!host || !user || password === undefined) {
    throw new IncompleteConnectionError(service.name);
  }

  return {
    database: resolvedDatabase,
    host,
    user,
    password,
    port,
    ssl
  };
};
