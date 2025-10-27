import type { Http } from '@ez4/gateway';

// Missing Http.Headers inheritance.
interface TestHeaders {}

declare class TestRequest implements Http.Request {
  headers: TestHeaders;
}

export declare class TestService extends Http.Service {
  routes: [
    {
      path: 'ANY /test-route';
      handler: typeof testRoute;
    }
  ];
}

export function testRoute(_request: TestRequest): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
