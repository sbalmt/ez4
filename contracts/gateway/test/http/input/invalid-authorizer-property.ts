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

// @ts-expect-error No extra property is allowed
declare class TestAuthRequest implements Http.AuthRequest {
  invalid_property: true;
}

declare class TestAuthResponse implements Http.AuthResponse {
  identity?: {};
}

function testAuthorizer(_request: TestAuthRequest): TestAuthResponse {
  return {
    identity: {}
  };
}

function testHandler(): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
