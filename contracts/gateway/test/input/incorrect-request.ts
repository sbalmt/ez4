import type { Http } from '@ez4/gateway';
import type { SuccessResponse } from './common.js';

// Missing Http.Request inheritance.
interface TestRequest {}

export declare class TestService extends Http.Service {
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
