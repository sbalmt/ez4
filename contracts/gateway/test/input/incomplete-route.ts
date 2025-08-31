import type { Http } from '@ez4/gateway';
import type { SuccessResponse } from './common.js';

export declare class TestService1 extends Http.Service {
  // @ts-ignore Missing required route path.
  routes: [
    {
      handler: typeof testRoute;
    }
  ];
}

export declare class TestService2 extends Http.Service {
  // @ts-ignore Missing required route handler.
  routes: [
    {
      path: 'ANY /test-route-1';
    }
  ];
}

export function testRoute(): SuccessResponse {
  return {
    status: 204
  };
}
