import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [
    // No Auth Cache.
    Http.UseRoute<{
      path: 'POST /test-route-1';
      handler: typeof testRoute;
    }>,

    // With Auth Cache.
    Http.UseRoute<{
      path: 'PATCH /test-route-2';
      authorizer: typeof testAuthorizer;
      handler: typeof testRoute;
    }>
  ];

  // Cache configuration.
  cache: Http.UseCache<{
    authorizerTTL: 5;
  }>;
}

interface SuccessAuthResponse extends Http.AuthResponse {
  identity: {};
}

function testAuthorizer(): SuccessAuthResponse {
  return {
    identity: {}
  };
}

function testRoute(): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
