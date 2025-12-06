import type { Http } from '@ez4/gateway';

// Missing Http.Defaults inheritance.
interface TestDefaults {}

export declare class TestService extends Http.Service {
  defaults: TestDefaults;

  routes: [];
}
