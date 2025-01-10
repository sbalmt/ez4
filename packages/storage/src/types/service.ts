import type { ServiceMetadata } from '@ez4/project/library';
import type { BucketCors } from './cors.js';

export const ServiceType = '@ez4/bucket';

export type BucketService = ServiceMetadata & {
  type: typeof ServiceType;
  name: string;
  localPath?: string;
  autoExpireDays?: number;
  cors?: BucketCors;
};

export const isBucketService = (service: ServiceMetadata): service is BucketService => {
  return service.type === ServiceType;
};
