import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [
    Http.UseRoute<{
      path: 'ANY /test-route';
      handler: typeof testRoute;
    }>
  ];
}

declare class TestResponse implements Http.Response {
  status: 200;

  // No extra property is allowed
  invalid_property: true;
}

function testRoute(): TestResponse {
  return {
    status: 200,
    invalid_property: true
  };
}
