import type { Bucket } from '@ez4/storage';
import type { Environment } from '@ez4/common';
import type { Cdn } from '@ez4/distribution';

declare class TestBucket extends Bucket.Service {}

export declare class TestCdn extends Cdn.Service {
  defaultOrigin: Cdn.UseDefaultOrigin<{
    bucket: Environment.Service<TestBucket>;
  }>;

  certificate: TestCertificate;
}

// Concrete class is not allowed.
class TestCertificate implements Cdn.Certificate {
  domain!: 'ez4.dev';
}
