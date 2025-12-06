import type { Http } from '@ez4/gateway';

// Missing Http.PathParameters inheritance.
interface TestParameters {}

declare class TestRequest implements Http.Request {
  parameters: TestParameters;
}

export declare class TestService extends Http.Service {
  routes: [
    Http.UseRoute<{
      path: 'ANY /test-route';
      handler: typeof testRoute;
    }>
  ];
}

export function testRoute(_request: TestRequest): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
