import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [
    // No CORS.
    Http.UseRoute<{
      path: 'POST /test-route-1';
      handler: typeof testRoute;
    }>,

    // With CORS.
    Http.UseRoute<{
      path: 'PATCH /test-route-2';
      handler: typeof testRoute;
      cors: true;
    }>
  ];

  // CORS configuration.
  cors: Http.UseCors<{
    allowOrigins: ['*'];
    allowMethods: ['*'];
    allowCredentials: true;
    allowHeaders: ['x-income-header'];
    exposeHeaders: ['x-exposed-header'];
    maxAge: 300;
  }>;
}

function testRoute(): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
