import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  defaults: TestDefaults;

  routes: [];
}

// Concrete class is not allowed.
class TestDefaults implements Http.Defaults {}
