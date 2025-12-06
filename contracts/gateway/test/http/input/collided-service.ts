import type { Environment, Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [
    Http.UseRoute<{
      path: 'ANY /test-route';
      handler: typeof testRoute;
    }>
  ];

  services: {
    selfClient: Environment.Service<TestService>;
  };
}

declare class TestRequest implements Http.Request {}

declare class TestCollidedService extends Http.Service {
  routes: [];
}

declare class TestProvider implements Http.Provider {
  services: {
    // Same service name, another service referenced.
    selfClient: Environment.Service<TestCollidedService>;
  };
}

function testRoute(_request: TestRequest, _context: Service.Context<TestProvider>): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
