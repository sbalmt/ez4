import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [];

  // Access configuration.
  access: {
    logRetention: 2;
    burstLimit: 1000;
    rateLimit: 500;
  };
}
