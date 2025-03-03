import type { Bucket } from '@ez4/storage';

// Missing Bucket.Cors inheritance.
declare class TestCors {
  allowOrigins: ['*'];
}

export declare class TestStorage extends Bucket.Service {
  cors: TestCors;
}
