import type { Http } from '@ez4/gateway';

/**
 * @description Service for testing route listener.
 */
export declare class TestService extends Http.Service {
  routes: [
    Http.UseRoute<{
      path: 'ANY /test-route';
      listener: typeof testListener;
      handler: typeof testHandler;
    }>
  ];
}

function testListener(): void {}

function testHandler(): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
