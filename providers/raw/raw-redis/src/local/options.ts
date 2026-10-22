import type { CacheService } from '@ez4/cache/library';
import type { ServeOptions } from '@ez4/project/library';
import type { ClientConnection } from '../client/types';

import { toSnakeCase } from '@ez4/utils';

import { getConnectionEnvNames } from '../triggers/utils';
import { LocalOptionsNotFoundError } from './errors';

/**
 * Connection from `localOptions.<service>` (`url` and `token`), falling back to the same env
 * vars used by the deploy.
 */
export const getConnectionOptions = (service: CacheService, options: ServeOptions): ClientConnection => {
  const optionsName = toSnakeCase(service.name);

  const serviceOptions = {
    ...options.localOptions[optionsName],
    ...(options.test && options.testOptions[optionsName])
  };

  const envNames = getConnectionEnvNames(service);

  const url = serviceOptions.url ?? process.env[envNames.url];
  const token = serviceOptions.token ?? process.env[envNames.token];

  if (!url) {
    throw new LocalOptionsNotFoundError(optionsName, service.name, envNames.url);
  }

  return {
    url,
    token
  };
};
