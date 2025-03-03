import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [];

  defaults: {
    catcher: typeof testCatcher;
    timeout: 15;
    memory: 192;
  };
}

export function testCatcher() {}
