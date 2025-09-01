import type { Http } from '@ez4/gateway';
import type { SuccessResponse } from './common';

// Concrete class is not allowed.
class TestRequest implements Http.Request {
  query = {};
}

export declare class TestService extends Http.Service {
  routes: [
    {
      path: 'ANY /test-route';
      handler: typeof testRoute;
    }
  ];
}

export function testRoute(_request: TestRequest): SuccessResponse {
  return {
    status: 204
  };
}
