import type { Bucket } from '@ez4/storage';

export declare class TestStorage extends Bucket.Service {
  localPath: './public';

  autoExpireDays: 30;

  // CORS configuration.
  cors: {
    allowOrigins: ['*'];
    allowMethods: ['*'];
    exposeHeaders: ['x-exposed-header'];
    allowHeaders: ['x-income-header'];
    maxAge: 300;
  };
}
