import type { Bucket } from '@ez4/storage';
import type { Cdn, OriginProtocol } from '@ez4/distribution';
import type { Environment } from '@ez4/common';

/**
 * Test distribution storage.
 */
export declare class TestBucket extends Bucket.Service {}

/**
 * Test distribution.
 */
export declare class TestCdn extends Cdn.Service {
  aliases: ['test-1.ez4.dev', 'test-2.ez4.dev'];

  certificate: {
    domain: 'ez4.dev';
  };

  defaultIndex: 'index.html';

  defaultOrigin: {
    bucket: Environment.Service<TestBucket>;
    location: '/site';
  };

  origins: [
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
      location: '/site';
      code: 404;
      ttl: 3600;
    }
  ];

  disabled: true;
}

declare class TestRegularOrigin1 implements Cdn.DefaultRegularOrigin {
  domain: 'ez4.default';
  path: 'default/regular/*';
  cache: TestCache;
}

declare class TestBucketOrigin1 implements Cdn.DefaultBucketOrigin {
  bucket: Environment.Service<TestBucket>;
  path: 'default/bucket/*';
}

declare class TestRegularOrigin2 implements Cdn.RegularOrigin {
  domain: 'ez4.additional';
  path: 'regular/*';
  location: 'internal';
  protocol: OriginProtocol.Http;
  port: 8080;
  headers: {
    authorization: 'Bearer test-token';
    ['x-api-key']: Environment.Variable<'TEST_ENV_VAR'>;
  };
}

declare class TestBucketOrigin2 implements Cdn.BucketOrigin {
  bucket: Environment.Service<TestBucket>;
  location: 'internal';
  path: 'bucket/*';
  cache: TestCache;
}

declare class TestCache implements Cdn.Cache {
  ttl: 300;

  minTTL: 1;

  maxTTL: 3600;

  compress: true;

  headers: ['header1', 'header2'];
}
