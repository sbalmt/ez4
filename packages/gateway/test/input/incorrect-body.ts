import type { Http, SuccessResponse } from '@ez4/gateway';

// Missing Http.JsonBody inheritance.
interface TestBody {}

declare class TestRequest implements Http.Request {
  body: TestBody;
}

export declare class TestService extends Http.Service<[TestRequest]> {
  id: 'ez4-test-service';

  name: 'Test Service';

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
