import type { ServiceMetadata } from '@ez4/project/library';

export const ServiceType = '@ez4/cdn';

export type CdnService = ServiceMetadata & {
  type: typeof ServiceType;
  name: string;
  description?: string;
  defaultIndex?: string;
  disabled?: boolean;
  compress?: boolean;
};

export const isCdnService = (service: ServiceMetadata): service is CdnService => {
  return service.type === ServiceType;
};
