import type { Http } from '@ez4/gateway';

class CustomError extends Error {}

export declare class TestService extends Http.Service {
  routes: [];

  defaults: {
    listener: typeof testListener;
    logRetention: 14;
    timeout: 15;
    memory: 192;
    httpErrors: {
      400: [CustomError];
    };
  };
}

export function testListener() {}
