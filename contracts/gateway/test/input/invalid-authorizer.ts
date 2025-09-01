import type { Http } from '@ez4/gateway';
import type { SuccessResponse } from './common';

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

export function testHandler(): SuccessResponse {
  return {
    status: 204
  };
}
