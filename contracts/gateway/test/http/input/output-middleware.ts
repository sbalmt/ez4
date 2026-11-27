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
      listener: typeof routeListener;
    }>
  ];
}

export function testHandler(): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}

export function defaultMiddleware<T extends Http.Request>(next: Http.Handler<T>, { defaultMiddlewareClient }: any): Http.Handler<T> {
  void defaultMiddlewareClient;

  return (request, context) => next(request, context);
}

export function routeMiddleware<T extends Http.Request>(next: Http.Handler<T>, { routeMiddlewareClient }: any): Http.Handler<T> {
  void routeMiddlewareClient;

  return (request, context) => next(request, context);
}

export function routeListener<T extends Http.Request>(_event: Http.ServiceEvent<T>, { routeListenerClient }: any): void {
  void routeListenerClient;
}
