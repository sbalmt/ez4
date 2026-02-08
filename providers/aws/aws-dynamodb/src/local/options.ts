import type { DatabaseService } from '@ez4/database/library';
import type { ServeOptions } from '@ez4/project/library';

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

  const { host = 'localhost', port = 8000 } = serviceOptions;

  return {
    endpoint: `http://${host}:${port}`
  };
};
