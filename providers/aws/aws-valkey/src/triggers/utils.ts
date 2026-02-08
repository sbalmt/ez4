import type { CacheService } from '@ez4/cache/library';
import type { CommonOptions, ServiceMetadata } from '@ez4/project/library';

import { getServiceName } from '@ez4/project/library';
import { isCacheService } from '@ez4/cache/library';

export const getCacheName = (service: CacheService, options: CommonOptions) => {
  return getServiceName(service, options);
};

export const isValkeyService = (service: ServiceMetadata): service is CacheService => {
  return isCacheService(service) && service.engine.name === 'valkey';
};
