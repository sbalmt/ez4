import type { Environment, Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [
    {
      path: 'ANY /test-route';
      handler: typeof testRoute;
    }
  ];
}

declare class TestRequest implements Http.Request {}

// Concrete class is not allowed.
class TestProvider implements Http.Provider {
  services!: {
    selfClient: Environment.Service<TestService>;
  };
}

function testRoute(_request: TestRequest, _context: Service.Context<TestProvider>): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
