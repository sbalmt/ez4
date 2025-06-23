import type { Http } from '@ez4/gateway';
import type { SuccessResponse } from './common.js';

declare class TestJsonRequest implements Http.Request {
  body: {
    foo: string;
    bar: number;
  };
}

declare class TestRawRequest implements Http.Request {
  body: Http.RawBody;
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

export function testRouteA(_request: TestJsonRequest): SuccessResponse {
  return {
    status: 204
  };
}

export function testRouteB(_request: Http.Incoming<TestRawRequest>): SuccessResponse {
  return {
    status: 204
  };
}
