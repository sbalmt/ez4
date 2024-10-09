import type { Bucket } from '@ez4/storage';
import type { CdnCache } from './cache.js';

/**
 * Origin protocols.
 */
export const enum OriginProtocol {
  Https = 'https',
  Http = 'http'
}

/**
 * Origin base.
 */
export interface CdnOrigin {
  /**
   * Path for the origin.
   */
  path: string;

  /**
   * Location path to append in the incoming request.
   */
  location?: string;

  /**
   * Origin cache.
   */
  cache?: CdnCache;
}

/**
 * Bucket origin.
 */
export interface CdnBucketOrigin extends CdnOrigin {
  /**
   * Bucket service used as the origin.
   */
  bucket: Bucket.Service;
}

/**
 * Regular origin.
 */
export interface CdnRegularOrigin extends CdnOrigin {
  /**
   * Domain used as the origin.
   */
  domain: string;

  /**
   * Origin headers.
   */
  headers?: Record<string, string>;

  /**
   * Origin protocol.
   */
  protocol?: OriginProtocol;

  /**
   * Origin port.
   */
  port?: number;
}
