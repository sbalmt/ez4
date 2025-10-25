import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [
    {
      path: 'ANY /test-route';
      handler: typeof testRoute;
    }
  ];
}

// Concrete class is not allowed.
class TestResponse implements Http.Response {
  status = 200;
}

function testRoute(): TestResponse {
  return {
    status: 200
  };
}
