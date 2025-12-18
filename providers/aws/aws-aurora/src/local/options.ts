import type { DatabaseService } from '@ez4/database/library';
import type { ServeOptions } from '@ez4/project/library';

import { getDatabaseName } from '@ez4/pgclient/library';
import { isEmptyObject, toSnakeCase } from '@ez4/utils';

import { LocalOptionsNotFoundError } from './errors';

export const getConnectionOptions = (service: DatabaseService, options: ServeOptions) => {
  const optionsName = toSnakeCase(service.name);

  const serviceOptions = {
    ...options.localOptions[optionsName],
    ...(options.test && options.testOptions[optionsName])
  };

  if (isEmptyObject(serviceOptions)) {
    throw new LocalOptionsNotFoundError(optionsName, service.name);
  }

  const { user, password, host, port, database } = serviceOptions;

  return {
    database: database ?? getDatabaseName(service, options),
    host: host ?? 'localhost',
    password,
    user,
    port
  };
};
