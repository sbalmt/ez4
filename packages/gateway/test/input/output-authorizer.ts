import type { NamingStyle } from '@ez4/schema';
import type { Http } from '@ez4/gateway';
import type { SuccessResponse } from './common.js';

/**
 * Service for testing route authorizers.
 */
export declare class TestService extends Http.Service {
  routes: [
    {
      path: 'ANY /test-route-a';
      authorizer: typeof testQueryAuthorizer;
      handler: typeof testHandler;
    },
    {
      path: 'ANY /test-route-b';
      authorizer: typeof testHeaderAuthorizer;
      handler: typeof testHandler;
    }
  ];
}

declare class TestQueryAuthRequest implements Http.AuthRequest {
  preferences: {
    namingStyle: NamingStyle.KebabCase;
  };
  query: {
    apiKey: string;
  };
}

declare class TestHeaderAuthRequest implements Http.AuthRequest {
  headers: {
    'x-api-key': string;
  };
}

declare class TestAuthResponse implements Http.AuthResponse {
  identity?: {
    id: string;
  };
}

export function testQueryAuthorizer(request: TestQueryAuthRequest): TestAuthResponse {
  if (request.query.apiKey !== 'test-token') {
    return { identity: undefined };
  }

  return {
    identity: {
      id: 'abc123'
    }
  };
}

export function testHeaderAuthorizer(request: TestHeaderAuthRequest): TestAuthResponse {
  if (request.headers['x-api-key'] !== 'test-token') {
    return { identity: undefined };
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
