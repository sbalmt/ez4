import type { Http } from '@ez4/gateway';

// Concrete class is not allowed.
class TestIdentity implements Http.Identity {}

declare class TestRequest implements Http.Request {
  identity: TestIdentity;
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
