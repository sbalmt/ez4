import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [
    Http.UseRoute<{
      path: 'ANY /test-route-a';
      handler: typeof testRouteA;
    }>
  ];
}

function testRouteA(_request: Http.EmptyRequest): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
