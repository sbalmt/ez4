import type { ServiceMetadata } from '@ez4/project/library';

export const ServiceType = '@ez4/bucket';

export type BucketService = ServiceMetadata & {
  type: typeof ServiceType;
  name: string;
  description?: string;
};

export const isBucketService = (service: ServiceMetadata): service is BucketService => {
  return service.type === ServiceType;
};
