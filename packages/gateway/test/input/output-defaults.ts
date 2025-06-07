import type { Http } from '@ez4/gateway';

class CustomError extends Error {}

export declare class TestService extends Http.Service {
  routes: [];

  defaults: {
    listener: typeof testListener;
    retention: 14;
    timeout: 15;
    memory: 192;
    errors: {
      400: [CustomError];
    };
  };
}

export function testListener() {}
