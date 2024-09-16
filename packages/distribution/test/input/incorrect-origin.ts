import type { Bucket } from '@ez4/storage';
import type { Environment } from '@ez4/common';
import type { Cdn } from '@ez4/distribution';

export declare class TestBucket extends Bucket.Service {}

export declare class TestCdn extends Cdn.Service {
  defaultOrigin: TestOrigin;
}

// Missing Cdn.BucketOrigin inheritance.
declare class TestOrigin {
  bucket: Environment.Service<TestBucket>;
}
