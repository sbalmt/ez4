import type { Http } from '@ez4/gateway';

// Concrete class is not allowed.
class TestCors implements Http.Cors {
  allowOrigins!: ['*'];
}

export declare class TestService extends Http.Service {
  routes: [];

  cors: TestCors;
}
