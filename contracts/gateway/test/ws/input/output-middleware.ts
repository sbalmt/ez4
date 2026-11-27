import type { Ws } from '@ez4/gateway';

export declare class TestService extends Ws.Service<{}> {
  defaults: Ws.UseDefaults<{
    middlewares: [typeof defaultMiddleware];
  }>;

  connect: Ws.UseConnect<{
    handler: typeof connectHandler;
    middlewares: [typeof connectMiddleware];
    listener: typeof connectListener;
  }>;

  disconnect: Ws.UseDisconnect<{
    handler: typeof disconnectHandler;
  }>;

  message: Ws.UseMessage<{
    handler: typeof messageHandler;
  }>;
}

export function connectHandler() {}
export function disconnectHandler() {}
export function messageHandler() {}

export function defaultMiddleware<T extends Ws.Request | Ws.Event, U extends Ws.Response | void>(
  next: Ws.Handler<T, U>,
  { defaultMiddlewareClient }: any
): Ws.Handler<T, U> {
  void defaultMiddlewareClient;

  return (request, context) => next(request, context);
}

export function connectMiddleware<T extends Ws.Event>(next: Ws.Handler<T, void>, { connectMiddlewareClient }: any): Ws.Handler<T, void> {
  void connectMiddlewareClient;

  return (request, context) => next(request, context);
}

export function connectListener<T extends Ws.Request | Ws.Event>(_event: Ws.ServiceEvent<T>, { connectListenerClient }: any): void {
  void connectListenerClient;
}
