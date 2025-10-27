import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [];

  access: TestAccess;
}

// Concrete class is not allowed.
class TestAccess implements Http.Access {
  logRetention!: 5;
}
