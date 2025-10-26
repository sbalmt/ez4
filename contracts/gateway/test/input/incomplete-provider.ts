import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [
    {
      path: 'ANY /test-route-a';
      handler: typeof testRouteA;
    },
    {
      path: 'ANY /test-route-b';
      handler: typeof testRouteB;
    }
  ];

  // Missing services
}

declare class TestRequest implements Http.Request {}

// @ts-ignore Missing required services definition.
declare class TestProvider implements Http.Provider {}

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
