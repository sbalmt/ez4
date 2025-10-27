import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [
    {
      path: 'ANY /test-route';
      handler: typeof testRoute;
    }
  ];
}

// Concrete class is not allowed.
class TestQueryStrings implements Http.QueryStrings {}

declare class TestRequest implements Http.Request {
  query: TestQueryStrings;
}

function testRoute(_request: TestRequest): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
