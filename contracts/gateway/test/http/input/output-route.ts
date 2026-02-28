import type { ArchitectureType, LogLevel, RuntimeType } from '@ez4/project';
import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [
    // Inline route.
    Http.UseRoute<{
      path: 'ANY /test-route-1';
      handler: typeof testRoute1;
      runtime: RuntimeType.Node24;
      logLevel: LogLevel.Debug;
      logRetention: 7;
      disabled: true;
    }>,

    // Route reference.
    TestRoute,

    // HEAD route.
    TestHeadRoute
  ];
}

declare class TestRoute implements Http.Route {
  path: 'GET /test-route-2';

  handler: typeof testRoute2;

  timeout: 30;

  memory: 512;

  architecture: ArchitectureType.Arm;

  files: ['path/to/file-a.txt', 'path/to/file-b.json'];

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

declare class TestHeadRoute implements Http.Route {
  path: 'HEAD /test-route-3';

  handler: typeof testRoute3;
}

function testRoute3(): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
