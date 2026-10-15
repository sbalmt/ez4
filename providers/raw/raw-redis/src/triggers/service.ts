import type { PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';
import type { CacheService } from '@ez4/cache/library';

import { createVirtualState } from '@ez4/common/library';

import { getConnectionDriver } from '../common/connection';
import { MissingConnectionTokenError, MissingConnectionUrlError } from './errors';
import { getCacheName, getConnectionEnvNames, getKeyPrefix, isRawRedisService } from './utils';

export const prepareCacheServices = (event: PrepareResourceEvent) => {
  const { service, options, context } = event;

  if (!isRawRedisService(service)) {
    return false;
  }

  getDeployConnection(service);

  // Nothing to provision, the server is managed outside EZ4.
  context.setVirtualServiceState(service, options, createVirtualState(service));

  return true;
};

export const prepareLinkedServices = (event: ServiceEvent) => {
  const { service, options } = event;

  if (!isRawRedisService(service)) {
    return null;
  }

  const { url, token } = getDeployConnection(service);

  const envNames = getConnectionEnvNames(service);

  const cacheName = getCacheName(service, options);
  const keyPrefix = getKeyPrefix(service, options);

  return {
    from: '@ez4/raw-redis/client',
    module: 'Client',
    constructor:
      `@{EZ4_MODULE_IMPORT}.make({ ` +
      `identifier: "${cacheName}", ` +
      `prefix: "${keyPrefix}", ` +
      `connection: { url: process.env.${envNames.url}, token: process.env.${envNames.token} }, ` +
      `debug: ${options.debug ?? false} ` +
      `})`,
    variables: {
      [envNames.url]: url,
      ...(token && { [envNames.token]: token })
    }
  };
};

const getDeployConnection = (service: CacheService) => {
  const envNames = getConnectionEnvNames(service);

  const url = process.env[envNames.url];
  const token = process.env[envNames.token];

  if (!url) {
    throw new MissingConnectionUrlError(envNames.url, service.name);
  }

  if (getConnectionDriver(url) === 'rest' && !token) {
    throw new MissingConnectionTokenError(envNames.token, service.name);
  }

  return {
    url,
    token
  };
};
