import type { Http } from '@ez4/gateway';

// Concrete class is not allowed.
class TestResponse implements Http.Response {
  status = 200;
}

export declare class TestService extends Http.Service {
  id: 'ez4-test-service';

  name: 'Test Service';

  routes: [
    {
      path: 'ANY /test-route';
      handler: typeof testRoute;
    }
  ];
}

export function testRoute(): TestResponse {
  return {
    status: 200
  };
}
