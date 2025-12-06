import type { NamingStyle } from '@ez4/schema';
import type { Http } from '@ez4/gateway';

/**
 * Service for testing route authorizers.
 */
export declare class TestService extends Http.Service {
  routes: [
    Http.UseRoute<{
      path: 'ANY /test-route-a';
      authorizer: typeof testQueryAuthorizer;
      handler: typeof testHandler;
      preferences: {
        namingStyle: NamingStyle.KebabCase;
      };
    }>,
    Http.UseRoute<{
      path: 'ANY /test-route-b';
      authorizer: typeof testHeaderAuthorizer;
      handler: typeof testHandler;
    }>
  ];
}

declare class TestQueryAuthRequest implements Http.AuthRequest {
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

function testQueryAuthorizer(request: TestQueryAuthRequest): TestAuthResponse {
  if (request.query.apiKey !== 'test-token') {
    return { identity: undefined };
  }

  return {
    identity: {
      id: 'abc123'
    }
  };
}

function testHeaderAuthorizer(request: TestHeaderAuthRequest): TestAuthResponse {
  if (request.headers['x-api-key'] !== 'test-token') {
    return { identity: undefined };
  }

  return {
    identity: {
      id: 'abc123'
    }
  };
}

declare class TestRequest implements Http.Request {
  identity: {
    id: string;
  };
}

function testHandler(request: TestRequest): Http.SuccessEmptyResponse {
  const { identity } = request;

  // Endure identity Id.
  identity.id;

  return {
    status: 204
  };
}
