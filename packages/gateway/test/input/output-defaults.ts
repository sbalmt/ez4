import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [];

  defaults: {
    timeout: 15;
    memory: 192;
  };
}
