import type { Http } from '@ez4/gateway';

// Missing Http.Access inheritance.
declare class TestAccess {
  logRetention: 5;
}

export declare class TestService extends Http.Service {
  routes: [];

  access: TestAccess;
}
