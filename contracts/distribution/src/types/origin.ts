import type { CdnCache } from './cache.js';

export type CdnOrigin = CdnBucketOrigin | CdnRegularOrigin;

export const enum CdnOriginType {
  Regular = 'regular',
  Bucket = 'bucket'
}

type CdnOriginBase = {
  type: CdnOriginType;
  location?: string;
  cache?: CdnCache;
  path?: string;
};

export type CdnRegularOrigin = CdnOriginBase & {
  domain: string;
  headers?: Record<string, string>;
  protocol?: string;
  port?: number;
};

export type CdnBucketOrigin = CdnOriginBase & {
  bucket: string;
};

export const isCdnRegularOrigin = (service: CdnOrigin): service is CdnRegularOrigin => {
  return service.type === CdnOriginType.Regular;
};

export const isCdnBucketOrigin = (service: CdnOrigin): service is CdnBucketOrigin => {
  return service.type === CdnOriginType.Bucket;
};
