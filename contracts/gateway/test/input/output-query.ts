import type { Http } from '@ez4/gateway';

declare class TestRequest implements Http.Request {
  query: {
    foo: string;
    bar: number;
  };
}

export declare class TestService extends Http.Service {
  routes: [
    {
      path: 'GET /test-route-a';
      handler: typeof testRouteA;
    },
    {
      path: 'GET /test-route-b';
      handler: typeof testRouteB;
    }
  ];
}

export function testRouteA(_request: TestRequest): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}

export function testRouteB(_request: Http.Incoming<TestRequest>): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
