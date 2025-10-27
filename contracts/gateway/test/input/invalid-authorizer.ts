import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [
    {
      path: 'ANY /test-route';
      authorizer: typeof testAuthorizer;
      handler: typeof testHandler;
    }
  ];
}

// Concrete class is not allowed.
class TestAuthRequest implements Http.AuthRequest {
  query = {};
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
