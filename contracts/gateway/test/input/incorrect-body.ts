import type { Http } from '@ez4/gateway';

// Missing Http.JsonBody inheritance.
interface TestBody {}

declare class TestRequest implements Http.Request {
  body: TestBody;
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
