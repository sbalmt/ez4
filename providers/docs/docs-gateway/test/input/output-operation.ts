import type { Http } from '@ez4/gateway';

export declare class TestApi extends Http.Service {
  name: 'Test API';

  routes: [
    Http.UseRoute<{
      name: 'operationName';
      path: 'GET /route';
      handler: typeof testHandler;
    }>
  ];
}

function testHandler(): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
