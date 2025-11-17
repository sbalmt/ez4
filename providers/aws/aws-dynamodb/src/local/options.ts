import type { DatabaseService } from '@ez4/database/library';
import type { ServeOptions } from '@ez4/project/library';

import { toSnakeCase } from '@ez4/utils';

import { LocalOptionsNotFoundError } from './errors';

export const getConnectionOptions = (service: DatabaseService, options: ServeOptions) => {
  const localOptions = options.localOptions[toSnakeCase(service.name)];

  if (!localOptions) {
    throw new LocalOptionsNotFoundError(service.name);
  }

  const { host = '127.0.0.1', port = '8000' } = localOptions;

  return {
    endpoint: `http://${host}:${port}`
  };
};
