import type { CdnCache } from './cache.js';

export type CdnOrigin = CdnBucketOrigin | CdnRegularOrigin;

export const enum CdnOriginType {
  Regular = 'regular',
  Bucket = 'bucket'
}

export type CdnRegularOrigin = {
  type: CdnOriginType;
  domain: string;
  location?: string;
  protocol?: string;
  cache?: CdnCache;
  path?: string;
  port?: number;
};

export type CdnBucketOrigin = {
  type: CdnOriginType;
  bucket: string;
  location?: string;
  cache?: CdnCache;
  path?: string;
};

export const isCdnRegularOrigin = (service: CdnOrigin): service is CdnRegularOrigin => {
  return service.type === CdnOriginType.Regular;
};

export const isCdnBucketOrigin = (service: CdnOrigin): service is CdnBucketOrigin => {
  return service.type === CdnOriginType.Bucket;
};
