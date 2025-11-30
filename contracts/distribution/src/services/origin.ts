import type { Bucket } from '@ez4/storage';
import type { CdnCache } from './cache';

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
  readonly path: string;

  /**
   * Location path to append in the incoming request.
   */
  readonly location?: string;

  /**
   * Origin cache.
   */
  readonly cache?: CdnCache;
}

/**
 * Bucket origin.
 */
export interface CdnBucketOrigin extends CdnOrigin {
  /**
   * Bucket service reference used as the origin.
   */
  readonly bucket: {
    readonly reference: Bucket.Service;
  };
}

/**
 * Regular origin.
 */
export interface CdnRegularOrigin extends CdnOrigin {
  /**
   * Domain used as the origin.
   */
  readonly domain: string;

  /**
   * Origin headers.
   */
  readonly headers?: Record<string, string>;

  /**
   * Origin protocol.
   */
  readonly protocol?: OriginProtocol;

  /**
   * Origin port.
   */
  readonly port?: number;
}
