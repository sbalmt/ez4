import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [];

  cache: TestCache;
}

// Concrete class is not allowed.
class TestCache implements Http.Cache {
  authorizerTTL!: 5;
}
