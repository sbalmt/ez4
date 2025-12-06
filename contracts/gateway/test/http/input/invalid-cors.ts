import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [];

  cors: TestCors;
}

// Concrete class is not allowed.
class TestCors implements Http.Cors {
  allowOrigins!: ['*'];
}
