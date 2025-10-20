import type { Http } from '@ez4/gateway';

// Concrete class is not allowed.
class TestAccess implements Http.Access {
  logRetention!: 5;
}

export declare class TestService extends Http.Service {
  routes: [];

  access: TestAccess;
}
