import type { Http } from '@ez4/gateway';
import type { SuccessResponse } from './common.js';

declare class TestRequest implements Http.Request {
  body: {
    foo: string;
    bar: number;
  };
}

export declare class TestService extends Http.Service<[TestRequest]> {
  routes: [
    {
      path: 'GET /test-route';
      handler: typeof testRoute;
    }
  ];
}

export function testRoute(_request: TestRequest): SuccessResponse {
  return {
    status: 204
  };
}
