import type { Http } from '@ez4/gateway';
import type { SuccessResponse } from './common.js';

// Missing Http.AuthRequest inheritance.
interface TestAuthRequest {}

declare class TestAuthResponse implements Http.AuthResponse {
  identity?: boolean;
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
    identity: false
  };
}

export function testHandler(): SuccessResponse {
  return {
    status: 204
  };
}
