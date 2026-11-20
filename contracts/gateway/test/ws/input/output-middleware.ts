import type { Ws } from '@ez4/gateway';

export declare class TestService extends Ws.Service<{}> {
  defaults: Ws.UseDefaults<{
    middlewares: [typeof defaultMiddleware];
  }>;

  connect: Ws.UseConnect<{
    handler: typeof connectHandler;
    middlewares: [typeof connectMiddleware];
  }>;

  disconnect: Ws.UseDisconnect<{
    handler: typeof disconnectHandler;
  }>;

  message: Ws.UseMessage<{
    handler: typeof messageHandler;
  }>;
}

export function defaultMiddleware<T extends Ws.Request | Ws.Event, U extends Ws.Response | void>(next: Ws.Handler<T, U>): Ws.Handler<T, U> {
  return (request, context) => next(request, context);
}

export function connectMiddleware<T extends Ws.Event>(next: Ws.Handler<T, void>): Ws.Handler<T, void> {
  return (request, context) => next(request, context);
}

export function connectHandler() {}
export function disconnectHandler() {}
export function messageHandler() {}
