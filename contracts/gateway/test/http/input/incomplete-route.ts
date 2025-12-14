import type { Http } from '@ez4/gateway';

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

export function testRoute(): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
