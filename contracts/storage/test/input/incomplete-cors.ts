import type { Bucket } from '@ez4/storage';

export declare class TestStorage extends Bucket.Service {
  // @ts-expect-error missing `allowOrigins`.
  cors: {};
}
