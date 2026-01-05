import type { ArchitectureType, RuntimeType } from '@ez4/project';
import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [
    // Inline route.
    Http.UseRoute<{
      path: 'ANY /test-route-1';
      handler: typeof testRoute1;
      runtime: RuntimeType.Node24;
      logRetention: 7;
      disabled: true;
    }>,

    // Route reference.
    TestRoute
  ];
}

declare class TestRoute implements Http.Route {
  path: 'GET /test-route-2';

  handler: typeof testRoute2;

  timeout: 30;

  memory: 512;

  architecture: ArchitectureType.Arm;

  variables: {
    TEST_VAR: 'test-literal-value';
  };
}

async function testRoute1(): Promise<Http.SuccessEmptyResponse> {
  return {
    status: 204
  };
}

function testRoute2(): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
