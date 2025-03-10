import type { Bucket } from '@ez4/storage';

// Concrete class is not allowed.
class TestCors implements Bucket.Cors {
  allowOrigins!: ['*'];
}

export declare class TestStorage extends Bucket.Service {
  cors: TestCors;
}
