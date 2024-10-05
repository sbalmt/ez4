import type { Bucket } from '@ez4/storage';
import type { Environment } from '@ez4/common';
import type { Cdn, OriginProtocol } from '@ez4/distribution';

/**
 * Test distribution storage.
 */
export declare class TestBucket extends Bucket.Service {}

/**
 * Test distribution.
 */
export declare class TestCdn extends Cdn.Service {
  aliases: ['test-1.ez4.dev', 'test-2.ez4.dev'];

  defaultIndex: 'index.html';

  defaultOrigin: {
    bucket: Environment.Service<TestBucket>;
    location: '/site';
  };

  additionalOrigins: [
    TestRegularOrigin1,
    TestBucketOrigin1,
    TestRegularOrigin2,
    TestBucketOrigin2,
    {
      domain: Environment.Variable<'TEST_ENV_VAR'>;
      path: 'inline/*';
    }
  ];

  fallbacks: [
    {
      code: 404;
      location: '/site';
      ttl: 3600;
    }
  ];

  cacheTTL: 300;

  minCacheTTL: 1;

  maxCacheTTL: 3600;

  disabled: true;

  compress: true;
}

declare class TestRegularOrigin1 implements Cdn.DefaultRegularOrigin {
  domain: 'ez4.default';
  path: 'default/regular/*';
}

declare class TestBucketOrigin1 implements Cdn.DefaultBucketOrigin {
  bucket: Environment.Service<TestBucket>;
  path: 'default/bucket/*';
}

declare class TestRegularOrigin2 implements Cdn.AdditionalRegularOrigin {
  domain: 'ez4.additional';
  path: 'regular/*';
  location: 'internal';
  protocol: OriginProtocol.Http;
  port: 8080;
}

declare class TestBucketOrigin2 implements Cdn.AdditionalBucketOrigin {
  bucket: Environment.Service<TestBucket>;
  location: 'internal';
  path: 'bucket/*';
}
