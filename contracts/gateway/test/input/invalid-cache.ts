import type { Http } from '@ez4/gateway';

// Concrete class is not allowed.
class TestCache implements Http.Cache {
  authorizerTTL!: 5;
}

export declare class TestService extends Http.Service {
  routes: [];

  cache: TestCache;
}
