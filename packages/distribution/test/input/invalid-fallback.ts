import type { Bucket } from '@ez4/storage';
import type { Environment } from '@ez4/common';
import type { Cdn } from '@ez4/distribution';

declare class TestBucket extends Bucket.Service {}

export declare class TestCdn extends Cdn.Service {
  defaultOrigin: {
    bucket: Environment.Service<TestBucket>;
    location: '/site';
  };

  fallbacks: [TestFallback];
}

// Concrete class is not allowed.
class TestFallback implements Cdn.Fallback {
  code!: 400;
  location!: '/site';
}
