import type { Http } from '@ez4/gateway';

// Missing Http.Response inheritance.
interface TestResponse {}

export declare class TestService extends Http.Service {
  // @ts-ignore doesn't respect typing.
  routes: [
    {
      path: 'ANY /test-route';
      handler: typeof testRoute;
    }
  ];
}

export function testRoute(): TestResponse {
  return {};
}
