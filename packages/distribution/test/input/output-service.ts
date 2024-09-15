import type { Bucket } from '@ez4/storage';
import type { Environment } from '@ez4/common';
import type { Cdn } from '@ez4/distribution';

/**
 * Test distribution storage.
 */
export declare class TestBucket extends Bucket.Service {}

/**
 * Test distribution.
 */
export declare class TestCdn extends Cdn.Service {
  defaultIndex: 'index.html';

  defaultOrigin: {
    bucket: Environment.Service<TestBucket>;
    originPath: '/site';
    localPath: './public';
  };

  defaultTTL: 300;

  minTTL: 1;

  maxTTL: 3600;

  disabled: true;

  compress: true;
}
