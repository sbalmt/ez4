import type { Http } from '@ez4/gateway';
import type { SuccessResponse } from './common';

// Missing Http.AuthRequest inheritance.
interface TestAuthRequest {}

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
