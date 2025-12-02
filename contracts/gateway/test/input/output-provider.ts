import type { Environment, Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [
    Http.UseRoute<{
      path: 'ANY /test-route-a';
      handler: typeof testRouteA;
    }>,
    Http.UseRoute<{
      path: 'ANY /test-route-b';
      handler: typeof testRouteB;
    }>
  ];

  services: {
    selfClient: Environment.Service<TestService>;
  };
}

declare class TestRequest implements Http.Request {}

declare class TestProvider implements Http.Provider {
  variables: {
    TEST_VAR1: 'test-literal-value';
    TEST_VAR2: Environment.Variable<'TEST_ENV_VAR'>;
  };

  services: {
    selfClient: Environment.Service<TestService>;
  };
}

function testRouteA(_request: TestRequest, _context: Service.Context<TestService>): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}

function testRouteB(_request: TestRequest, _context: Service.Context<TestProvider>): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
