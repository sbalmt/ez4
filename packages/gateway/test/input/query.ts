import type { Http, SuccessResponse } from '@ez4/gateway';

declare class TestRequest implements Http.Request {
  query: {
    foo: string;
    bar: number;
  };
}

/**
 * Service for testing query strings.
 */
export declare class TestService extends Http.Service<[TestRequest]> {
  id: 'ez4-test-service';

  name: 'Test Service';

  routes: [
    {
      path: 'GET /test-route';
      handler: typeof testRoute;
    }
  ];
}

export function testRoute(_request: TestRequest): SuccessResponse {
  return {
    status: 204
  };
}
