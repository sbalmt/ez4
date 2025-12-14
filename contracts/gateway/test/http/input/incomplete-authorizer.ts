import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [
    Http.UseRoute<{
      path: 'ANY /test-route';
      authorizer: typeof testAuthorizer;
      handler: typeof testRoute;
    }>
  ];
}

declare class TestAuthResponse implements Http.AuthResponse {}

// Missing authorizer `identity`
export function testAuthorizer(): TestAuthResponse {
  return {};
}

export function testRoute(): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
