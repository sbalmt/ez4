import type { Http } from '@ez4/gateway';

// Missing Http.Cache inheritance.
declare class TestCache {
  authorizerTTL: 5;
}

export declare class TestService extends Http.Service {
  routes: [];

  cache: TestCache;
}
