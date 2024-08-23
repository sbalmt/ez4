import type { Http } from '@ez4/gateway';
import type { SuccessResponse } from './common.js';

/**
 * Service for testing route authorizers.
 */
export declare class TestService extends Http.Service {
  routes: [
    {
      path: 'ANY /test-route';
      authorizer: typeof testAuthorizer;
      handler: typeof testHandler;
    }
  ];
}

declare class TestAuthRequest implements Http.AuthRequest {
  query: {
    apiKey: string;
  };
}

declare class TestAuthResponse implements Http.AuthResponse {
  identity?: {
    id: string;
  };
}

export function testAuthorizer(request: TestAuthRequest): TestAuthResponse {
  if (request.query.apiKey !== 'test-token') {
    return {
      identity: undefined
    };
  }

  return {
    identity: {
      id: 'abc123'
    }
  };
}

export function testHandler(): SuccessResponse {
  return {
    status: 204
  };
}
