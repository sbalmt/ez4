import type { Http, SuccessResponse } from '@ez4/gateway';

// Missing Http.PathParameters inheritance.
interface TestParameters {}

declare class TestRequest implements Http.Request {
  parameters: TestParameters;
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
