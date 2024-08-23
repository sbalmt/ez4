import type { Http } from '@ez4/gateway';
import type { SuccessResponse } from './common.js';

export declare class TestService extends Http.Service {
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

  timeout: 30;

  memory: 512;

  variables: {
    TEST_VAR: 'test-literal-value';
  };
}

export function testRoute(): SuccessResponse {
  return {
    status: 204
  };
}
