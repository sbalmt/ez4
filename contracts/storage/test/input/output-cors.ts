import type { Bucket } from '@ez4/storage';

export declare class TestStorage extends Bucket.Service {
  // CORS configuration.
  cors: Bucket.UseCors<{
    allowOrigins: ['*'];
    allowMethods: ['*'];
    exposeHeaders: ['x-exposed-header'];
    allowHeaders: ['x-income-header'];
    maxAge: 300;
  }>;
}
