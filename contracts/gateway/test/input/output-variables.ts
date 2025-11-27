import type { Environment, Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [
    Http.UseRoute<{
      path: 'ANY /test-route';
      handler: typeof testRoute;
    }>
  ];

  variables: {
    TEST_VAR1: 'test-literal-value';
    TEST_VAR2: Environment.Variable<'TEST_ENV_VAR'>;
  };

  services: {
    selfSettings: Environment.ServiceVariables;
  };
}

declare class TestRequest implements Http.Request {}

function testRoute(_request: Http.Incoming<TestRequest>, context: Service.Context<TestService>): Http.SuccessEmptyResponse {
  const { selfSettings } = context;

  // Ensure variables are property referenced.
  selfSettings.TEST_VAR1;
  selfSettings.TEST_VAR2;

  return {
    status: 204
  };
}
