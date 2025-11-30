import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [
    Http.UseRoute<{
      path: 'ANY /test-route';
      handler: typeof testRoute;
    }>
  ];
}

// Concrete class is not allowed.
class TestParameters implements Http.PathParameters {}

declare class TestRequest implements Http.Request {
  parameters: TestParameters;
}

function testRoute(_request: TestRequest): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
