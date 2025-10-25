import type { Http } from '@ez4/gateway';

// Concrete class is not allowed.
class TestQueryStrings implements Http.QueryStrings {}

declare class TestRequest implements Http.Request {
  query: TestQueryStrings;
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
