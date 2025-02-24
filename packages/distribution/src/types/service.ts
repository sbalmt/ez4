import type { ServiceMetadata } from '@ez4/project/library';
import type { CdnCertificate } from './certificate.js';
import type { CdnFallback } from './fallback.js';
import type { CdnOrigin } from './origin.js';

export const ServiceType = '@ez4/cdn';

export type CdnService = ServiceMetadata & {
  type: typeof ServiceType;
  name: string;
  aliases: string[];
  certificate?: CdnCertificate;
  description?: string;
  defaultOrigin: CdnOrigin;
  defaultIndex?: string;
  origins?: CdnOrigin[];
  fallbacks?: CdnFallback[];
  disabled?: boolean;
};

export const isCdnService = (service: ServiceMetadata): service is CdnService => {
  return service.type === ServiceType;
};
