import type { Http } from '@ez4/gateway';

// Missing Http.Cors inheritance.
declare class TestCors {
  allowOrigins: ['*'];
}

export declare class TestService extends Http.Service {
  routes: [];

  cors: TestCors;
}
