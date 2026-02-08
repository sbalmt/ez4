import type { CacheService } from '@ez4/cache/library';
import type { ServeOptions } from '@ez4/project/library';

import { isEmptyObject, toSnakeCase } from '@ez4/utils';

import { LocalOptionsNotFoundError } from './errors';

export const getConnectionOptions = (service: CacheService, options: ServeOptions) => {
  const optionsName = toSnakeCase(service.name);

  const serviceOptions = {
    ...options.localOptions[optionsName],
    ...(options.test && options.testOptions[optionsName])
  };

  if (isEmptyObject(serviceOptions)) {
    throw new LocalOptionsNotFoundError(optionsName, service.name);
  }

  const { host = 'localhost', port } = serviceOptions;

  return {
    endpoint: host,
    port
  };
};
