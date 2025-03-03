import type { Http } from '@ez4/gateway';
import type { SuccessResponse } from './common.js';

// Missing Http.PathParameters inheritance.
interface TestParameters {}

declare class TestRequest implements Http.Request {
  parameters: TestParameters;
}

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
