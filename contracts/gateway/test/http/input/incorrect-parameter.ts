import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [
    Http.UseRoute<{
      path: 'ANY /test-route';
      handler: typeof testRoute;
    }>
  ];
}

// Missing Http.PathParameters inheritance.
interface TestParameters {}

declare class TestRequest implements Http.Request {
  parameters: TestParameters;
}

export function testRoute(_request: TestRequest): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
