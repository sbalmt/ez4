import type { ServiceMetadata } from '@ez4/project/library';
import type { CdnOrigin } from './origin.js';

export const ServiceType = '@ez4/cdn';

export type CdnService = ServiceMetadata & {
  type: typeof ServiceType;
  name: string;
  description?: string;
  defaultOrigin: CdnOrigin;
  defaultIndex?: string;
  cacheTTL?: number;
  maxCacheTTL?: number;
  minCacheTTL?: number;
  compress?: boolean;
  disabled?: boolean;
};

export const isCdnService = (service: ServiceMetadata): service is CdnService => {
  return service.type === ServiceType;
};
