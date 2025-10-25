import type { Http } from '@ez4/gateway';

// Concrete class is not allowed.
class TestAuthRequest implements Http.AuthRequest {
  query = {};
}

declare class TestAuthResponse implements Http.AuthResponse {
  identity?: {};
}

export declare class TestService extends Http.Service {
  routes: [
    {
      path: 'ANY /test-route';
      authorizer: typeof testAuthorizer;
      handler: typeof testHandler;
    }
  ];
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
