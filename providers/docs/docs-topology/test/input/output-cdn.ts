import type { Cdn } from '@ez4/distribution';
import type { Environment } from '@ez4/common';
import type { Bucket } from '@ez4/storage';

export declare class TestBucket extends Bucket.Service {}

export declare class TestCdn extends Cdn.Service {
  aliases: [];

  defaultOrigin: {
    bucket: Environment.Service<TestBucket>;
  };
}
