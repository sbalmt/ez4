import type { DatabaseService } from '@ez4/database/library';
import type { ServeOptions } from '@ez4/project/library';

import { getDatabaseName } from '@ez4/pgclient/library';
import { toSnakeCase } from '@ez4/utils';

import { LocalOptionsNotFoundError } from './errors';

export const getConnectionOptions = (service: DatabaseService, options: ServeOptions) => {
  const localOptions = options.localOptions[toSnakeCase(service.name)];

  if (!localOptions) {
    throw new LocalOptionsNotFoundError(service.name);
  }

  const { user, password, host, port, database = getDatabaseName(service, options) } = localOptions;

  return {
    database: options.test ? `${database}_test` : database,
    host: host ?? 'localhost',
    password,
    user,
    port
  };
};
