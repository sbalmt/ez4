import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [
    // No CORS.
    {
      path: 'POST /test-route-1';
      handler: typeof testRoute;
    },

    // With CORS.
    {
      path: 'PATCH /test-route-2';
      handler: typeof testRoute;
      cors: true;
    }
  ];

  // CORS configuration.
  cors: {
    allowOrigins: ['*'];
    allowMethods: ['*'];
    allowCredentials: true;
    allowHeaders: ['x-income-header'];
    exposeHeaders: ['x-exposed-header'];
    maxAge: 300;
  };
}

export function testRoute(): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
