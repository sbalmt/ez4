import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [
    Http.UseRoute<{
      path: 'ANY /test-route';
      authorizer: typeof testAuthorizer;
      handler: typeof testHandler;
    }>
  ];
}

// Missing Http.AuthRequest inheritance.
interface TestAuthRequest {}

declare class TestAuthResponse implements Http.AuthResponse {
  identity?: {};
}

export function testAuthorizer(_request: TestAuthRequest): TestAuthResponse {
  return {
    identity: {}
  };
}

export function testHandler(): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
