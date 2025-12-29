import { createServiceMetadata, type ServiceMetadata } from '@ez4/project/library';

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

export type CdnCache = {
  compress?: boolean;
  headers?: string[];
  cookies?: string[];
  queries?: string[];
  maxTTL?: number;
  minTTL?: number;
  ttl?: number;
};

export type CdnFallback = {
  code: number;
  location: string;
  ttl?: number;
};

export type CdnCertificate = {
  domain: string;
};

export type CdnOrigin = CdnBucketOrigin | CdnRegularOrigin;

export const enum CdnOriginType {
  Regular = 'regular',
  Bucket = 'bucket'
}

export type CdnRegularOrigin = CdnOriginBase & {
  domain: string;
  headers?: Record<string, string>;
  protocol?: string;
  port?: number;
};

export type CdnBucketOrigin = CdnOriginBase & {
  bucket: string;
};

type CdnOriginBase = {
  type: CdnOriginType;
  location?: string;
  cache?: CdnCache;
  path?: string;
};

export const isCdnService = (service: ServiceMetadata): service is CdnService => {
  return service.type === ServiceType;
};

export const createCdnService = (name: string) => {
  return createServiceMetadata<CdnService>(ServiceType, name);
};

export const isCdnRegularOrigin = (service: CdnOrigin): service is CdnRegularOrigin => {
  return service.type === CdnOriginType.Regular;
};

export const isCdnBucketOrigin = (service: CdnOrigin): service is CdnBucketOrigin => {
  return service.type === CdnOriginType.Bucket;
};
