import type { Http } from '@ez4/gateway';

// Concrete class is not allowed.
class TestDefaults implements Http.Defaults {}

export declare class TestService extends Http.Service {
  defaults: TestDefaults;

  routes: [];
}
