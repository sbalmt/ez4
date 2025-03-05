import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [];

  defaults: {
    listener: typeof testListener;
    timeout: 15;
    memory: 192;
  };
}

export function testListener() {}
