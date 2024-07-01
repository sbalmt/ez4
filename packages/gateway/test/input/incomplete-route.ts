import type { Http, SuccessResponse } from '@ez4/gateway';

export declare class TestService1 extends Http.Service {
  id: 'ez4-test-service';

  name: 'Test Service 1';

  // @ts-ignore Missing required route path.
  routes: [
    {
      handler: typeof testRoute;
    }
  ];
}

export declare class TestService2 extends Http.Service {
  id: 'ez4-test-service';

  name: 'Test Service 2';

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
