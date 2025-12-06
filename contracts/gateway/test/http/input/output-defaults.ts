import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [];

  defaults: Http.UseDefaults<{
    listener: typeof testListener;
    logRetention: 14;
    timeout: 15;
    memory: 192;
    httpErrors: {
      400: [CustomError];
    };
  }>;
}

class CustomError extends Error {}

function testListener() {}
