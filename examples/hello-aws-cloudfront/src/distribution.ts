import type { Environment } from '@ez4/common';
import type { Cdn } from '@ez4/distribution';

import type { SiteBucket } from './storage';

/**
 * Example of AWS CloudFront deploy with EZ4.
 */
export declare class Site extends Cdn.Service {
  /**
   * Specify the default index file path.
   */
  defaultIndex: 'index.html';

  /**
   * Aliases authorized to access CloudFront.
   */
  aliases: ['a.custom-domain.com', 'b.custom-domain.com'];

  /**
   * Specify the certificate for the given alias domain.
   */
  certificate: Cdn.UseCertificate<{
    domain: '*.custom-domain.com';
  }>;

  /**
   * Default origin coming from bucket.
   */
  defaultOrigin: Cdn.UseDefaultOrigin<{
    bucket: Environment.Service<SiteBucket>;
    cache: StaticCache;

    // Prefer using rewrite than fallbacks approach when using API origins.
    rewrite: {
      '/path/*': 'index.html';
    };
  }>;

  /**
   * Other origins.
   */
  origins: [
    /**
     * Forward origin example.
     */
    Cdn.UseOrigin<{
      path: 'forward/*';
      domain: 'another.domain';
    }>,

    /**
     * API origin example.
     */
    Cdn.UseOrigin<{
      path: 'api/*';
      domain: 'api.domain';
      cache: ApiCache;
    }>
  ];

  /**
   * Fallback 404 to default index (Useful for SPAs)
   * Prefer using fallbacks approach than rewrite for static only websites.
   */
  fallbacks: [
    Cdn.UseFallback<{
      code: 404;
      location: '/index.html';
    }>
  ];

  /**
   * Determines the invalidation paths.
   */
  invalidations: ['/path/*'];
}

/**
 * Cache policy for static files.
 */
declare class StaticCache implements Cdn.Cache {
  ttl: 600;
  minTTL: 0;
  maxTTL: 3600;
}

/**
 * Cache policy for API requests.
 */
declare class ApiCache implements Cdn.Cache {
  headers: ['Authorization'];
  ttl: 1;
}
