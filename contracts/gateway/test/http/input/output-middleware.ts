import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  defaults: Http.UseDefaults<{
    middlewares: [typeof defaultMiddleware];
  }>;

  routes: [
    Http.UseRoute<{
      path: 'ANY /test-route';
      handler: typeof testHandler;
      middlewares: [typeof routeMiddleware];
    }>
  ];
}

export function defaultMiddleware(next: Http.Handler<Http.Request>): Http.Handler<Http.Request> {
  return (request, context) => next(request, context);
}

export function routeMiddleware(next: Http.Handler<Http.Request>): Http.Handler<Http.Request> {
  return (request, context) => next(request, context);
}

export function testHandler(): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
