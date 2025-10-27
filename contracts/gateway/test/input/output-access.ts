import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [];

  // Access configuration.
  access: {
    logRetention: 2;
  };
}
