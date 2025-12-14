import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [
    Http.UseRoute<{
      path: 'ANY /test/{path}/route';
      handler: typeof testRoute;
    }>
  ];
}

declare class TestRequest implements Http.Request {
  parameters: {
    PATH: string;
  };
}

export function testRoute(_request: TestRequest): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
