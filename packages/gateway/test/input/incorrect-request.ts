import type { Http, SuccessResponse } from '@ez4/gateway';

// Missing Http.Request inheritance.
interface TestRequest {}

export declare class TestService extends Http.Service {
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
