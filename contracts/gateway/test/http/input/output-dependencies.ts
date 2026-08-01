import type { Environment, Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';

type TestRequest = {};

export declare class TestService extends Http.Service {
  routes: [
    Http.UseRoute<{
      path: 'GET /test-route';
      handler: typeof testRoute;
    }>
  ];

  services: {
    selfOptions: Environment.ServiceOptions;
    selfVariables: Environment.ServiceVariables;
    selfClient: Environment.Service<TestService>;
  };
}

function testRoute(
  _request: Http.Incoming<TestRequest>,
  { selfOptions, selfVariables }: Service.Context<TestService>
): Http.SuccessEmptyResponse {
  selfVariables;
  selfOptions;

  return {
    status: 204
  };
}
