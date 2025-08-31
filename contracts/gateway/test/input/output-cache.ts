import type { Http } from '@ez4/gateway';
import type { SuccessResponse, SuccessAuthResponse } from './common.js';

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
    status: 200
  };
}

export function testRoute(): SuccessResponse {
  return {
    status: 204
  };
}
