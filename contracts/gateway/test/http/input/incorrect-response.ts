import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  // @ts-ignore doesn't respect typing.
  routes: [
    {
      path: 'ANY /test-route';
      handler: typeof testRoute;
    }
  ];
}

// Missing Http.Response inheritance.
interface TestResponse {}

export function testRoute(): TestResponse {
  return {};
}
