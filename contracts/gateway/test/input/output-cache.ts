import type { Http } from '@ez4/gateway';
import type { SuccessAuthResponse } from './common';

export declare class TestService extends Http.Service {
  routes: [
    // No Auth Cache.
    {
      path: 'POST /test-route-1';
      handler: typeof testRoute;
    },

    // With Auth Cache.
    {
      path: 'PATCH /test-route-2';
      authorizer: typeof testAuthorizer;
      handler: typeof testRoute;
    }
  ];

  // Cache configuration.
  cache: {
    authorizerTTL: 5;
  };
}

export function testAuthorizer(): SuccessAuthResponse {
  return {
    identity: {}
  };
}

export function testRoute(): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
