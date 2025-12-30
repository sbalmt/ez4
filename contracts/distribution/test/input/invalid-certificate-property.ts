import type { Bucket } from '@ez4/storage';
import type { Environment } from '@ez4/common';
import type { Cdn } from '@ez4/distribution';

declare class TestBucket extends Bucket.Service {}

export declare class TestCdn extends Cdn.Service {
  defaultOrigin: Cdn.UseDefaultOrigin<{
    bucket: Environment.Service<TestBucket>;
  }>;

  certificate: Cdn.UseCertificate<{
    domain: 'ez4.dev';

    // No extra property is allowed.
    invalid_property: true;
  }>;
}
