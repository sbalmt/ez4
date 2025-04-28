import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [];

  defaults: {
    listener: typeof testListener;
    retention: 14;
    timeout: 15;
    memory: 192;
  };
}

export function testListener() {}
