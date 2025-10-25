import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [
    // Inline route.
    {
      path: 'ANY /test-route-1';
      handler: typeof testRoute1;
      logRetention: 7;
    },

    // Route reference.
    TestRoute
  ];
}

export declare class TestRoute implements Http.Route {
  path: 'GET /test-route-2';

  handler: typeof testRoute2;

  timeout: 30;

  memory: 512;

  variables: {
    TEST_VAR: 'test-literal-value';
  };
}

export async function testRoute1(): Promise<Http.SuccessEmptyResponse> {
  return {
    status: 204
  };
}

export function testRoute2(): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
