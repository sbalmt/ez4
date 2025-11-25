import type { DatabaseService } from '@ez4/database/library';
import type { ServeOptions } from '@ez4/project/library';

import { isEmptyObject, toSnakeCase } from '@ez4/utils';

import { LocalOptionsNotFoundError } from './errors';

export const getConnectionOptions = (service: DatabaseService, options: ServeOptions) => {
  const serviceName = toSnakeCase(service.name);

  const serviceOptions = {
    ...options.localOptions[serviceName],
    ...(options.test && options.testOptions[serviceName])
  };

  if (isEmptyObject(serviceOptions)) {
    throw new LocalOptionsNotFoundError(service.name);
  }

  const { host = 'localhost', port = '8000' } = serviceOptions;

  return {
    endpoint: `http://${host}:${port}`
  };
};
