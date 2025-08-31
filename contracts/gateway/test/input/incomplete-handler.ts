import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [
    {
      path: 'ANY /test-route';
      handler: typeof testRoute;
    }
  ];
}

// Missing explicit handler response.
export function testRoute() {
  return {
    status: 204
  };
}
