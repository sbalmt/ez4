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
    localPath: './public';
  };
}