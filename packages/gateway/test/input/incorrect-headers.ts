import type { Http } from '@ez4/gateway';
import type { SuccessResponse } from './common.js';

// Missing Http.Headers inheritance.
interface TestHeaders {}

declare class TestRequest implements Http.Request {
  headers: TestHeaders;
}

export declare class TestService extends Http.Service<[TestRequest]> {
  routes: [
    {
      path: 'ANY /test-route';
      handler: typeof testRoute;
    }
  ];
}

export function testRoute(_request: TestRequest): SuccessResponse {
  return {
    status: 204
  };
}
