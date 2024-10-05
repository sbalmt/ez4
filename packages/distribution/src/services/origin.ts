import type { Bucket } from '@ez4/storage';

/**
 * Origin protocols.
 */
export const enum OriginProtocol {
  Https = 'https',
  Http = 'http'
}

/**
 * Bucket origin.
 */
export interface BucketOrigin {
  /**
   * Bucket service used as the origin.
   */
  bucket: Bucket.Service;

  /**
   * Location path to append in the incoming request.
   */
  location?: string;
}

/**
 * Regular origin.
 */
export interface RegularOrigin {
  /**
   * Path for the origin.
   */
  path: string;

  /**
   * Domain used as the origin.
   */
  domain: string;

  /**
   * Location path to append in the incoming request.
   */
  location?: string;

  /**
   * Origin protocol.
   */
  protocol?: OriginProtocol;

  /**
   * Origin port.
   */
  port?: number;
}
