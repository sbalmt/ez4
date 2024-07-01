import type { Http, SuccessResponse } from '@ez4/gateway';

/**
 * Service for testing routes.
 */
export declare class TestService extends Http.Service {
  id: 'ez4-test-service';

  name: 'Test Service';

  routes: [
    // Inline route.
    {
      path: 'ANY /test-route-1';
      handler: typeof testRoute;
    },

    // Route reference.
    TestRoute
  ];
}

export declare class TestRoute implements Http.Route {
  path: 'GET /test-route-2';

  handler: typeof testRoute;

  variables: {
    TEST_VAR: 'test-literal-value';
  };
}

export function testRoute(): SuccessResponse {
  return {
    status: 204
  };
}
