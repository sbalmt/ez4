import type { ServiceMetadata } from '@ez4/project/library';

import { createServiceMetadata } from '@ez4/project/library';

export const ServiceType = '@ez4/cache';

export type CacheService = Omit<ServiceMetadata, 'variables' | 'services'> &
  Required<Pick<ServiceMetadata, 'variables' | 'services'>> & {
    type: typeof ServiceType;
    description?: string;
    engine: CacheEngine;
  };

export type CacheEngine = {
  name: string;
};

export const isCacheService = (service: ServiceMetadata): service is CacheService => {
  return service.type === ServiceType;
};

export const createCacheService = (name: string) => {
  return {
    ...createServiceMetadata<CacheService>(ServiceType, name),
    variables: {},
    services: {}
  };
};
