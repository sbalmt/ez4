import type { Environment } from '@ez4/common';
import type { Cdn } from '@ez4/distribution';

import type { SiteBucket } from './storage.js';

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
  aliases: ['a.custom-domain.tld', 'b.custom-domain.tld'];

  /**
   * Specify the certificate for the given alias domain.
   */
  certificate: {
    domain: '*.custom-domain.tld';
  };

  /**
   * Default origin coming from bucket.
   */
  defaultOrigin: {
    bucket: Environment.Service<SiteBucket>;
    cache: {
      ttl: 600;
      minTTL: 0;
      maxTTL: 3600;
    };
  };

  /**
   * Other origins.
   */
  origins: [
    {
      path: 'forward/*';
      domain: 'another.domain';
      cache: {
        headers: ['Authorization'];
        ttl: 600;
      };
    }
  ];

  /**
   * Fallback 404 to default index (Useful for SPAs)
   */
  fallbacks: [
    {
      code: 404;
      location: '/index.html';
    }
  ];
}
