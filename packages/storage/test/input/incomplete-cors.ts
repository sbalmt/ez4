import type { Bucket } from '@ez4/storage';

export declare class TestStorage extends Bucket.Service {
  localPath: './public';

  autoExpireDays: 30;

  // @ts-ignore missing `allowOrigins`.
  cors: {};
}
