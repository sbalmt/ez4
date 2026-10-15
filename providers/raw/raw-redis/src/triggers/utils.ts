import type { CacheService } from '@ez4/cache/library';
import type { CommonOptions, ServiceMetadata } from '@ez4/project/library';

import { getServiceName } from '@ez4/project/library';
import { isCacheService } from '@ez4/cache/library';
import { toSnakeCase } from '@ez4/utils';

export const isRawRedisService = (service: ServiceMetadata): service is CacheService => {
  return isCacheService(service) && service.engine.name === 'raw-redis';
};

export const getCacheName = (service: CacheService, options: CommonOptions) => {
  return getServiceName(service, options);
};

/**
 * Keys are namespaced by the service name (prefix, project, branch and service), so different
 * stages and projects can share the same server.
 */
export const getKeyPrefix = (service: CacheService, options: CommonOptions) => {
  return `${getCacheName(service, options)}:`;
};

export const getConnectionEnvNames = (service: CacheService) => {
  const baseName = `EZ4_RAW_REDIS_${toSnakeCase(service.name).toUpperCase()}`;

  return {
    url: `${baseName}_URL`,
    token: `${baseName}_TOKEN`
  };
};
