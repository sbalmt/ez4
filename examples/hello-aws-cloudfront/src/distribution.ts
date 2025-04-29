import type { Environment } from '@ez4/common';
import type { Cdn } from '@ez4/distribution';

import type { SiteBucket } from './storage.js';

/**
 * Example of AWS CloudFront deploy with EZ4.
 */
export declare class Site extends Cdn.Service {
  defaultIndex: 'index.html';

  defaultOrigin: {
    bucket: Environment.Service<SiteBucket>;
    cache: {
      ttl: 600;
      minTTL: 0;
      maxTTL: 3600;
    };
  };

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

  // Fallback 404 to default index (Useful for SPAs)
  fallbacks: [
    {
      code: 404;
      location: '/index.html';
    }
  ];
}
