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

export function defaultMiddleware<T extends Http.Request>(next: Http.Handler<T>): Http.Handler<T> {
  return (request, context) => next(request, context);
}

export function routeMiddleware<T extends Http.Request>(next: Http.Handler<T>): Http.Handler<T> {
  return (request, context) => next(request, context);
}

export function testHandler(): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
