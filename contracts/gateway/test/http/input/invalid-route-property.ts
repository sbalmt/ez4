import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [
    Http.UseRoute<{
      path: 'ANY /test-route';
      handler: typeof testRoute;

      // No extra property is allowed
      invalid_property: true;
    }>
  ];
}

declare class TestResponse implements Http.Response {
  status: 200;
}

function testRoute(): TestResponse {
  return {
    status: 200
  };
}
