import type { ServiceMetadata } from '@ez4/project/library';
import type { BucketCors, BucketEvent } from './common';

import { createServiceMetadata } from '@ez4/project/library';

export const ServiceType = '@ez4/bucket';

export type BucketService = Omit<ServiceMetadata, 'variables' | 'services'> &
  Required<Pick<ServiceMetadata, 'variables' | 'services'>> & {
    type: typeof ServiceType;
    name: string;
    localPath?: string;
    globalName?: string;
    autoExpireDays?: number;
    events?: BucketEvent;
    cors?: BucketCors;
  };

export const isBucketService = (service: ServiceMetadata): service is BucketService => {
  return service.type === ServiceType;
};

export const createBucketService = (name: string) => {
  return {
    ...createServiceMetadata<BucketService>(ServiceType, name),
    variables: {},
    services: {}
  };
};
