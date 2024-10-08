import type { Http } from '@ez4/gateway';

// Missing Http.JsonBody inheritance.
declare class TestCors {
  allowOrigins: ['*'];
}

export declare class TestService extends Http.Service {
  routes: [];

  cors: TestCors;
}
