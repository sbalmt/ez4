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

export function defaultMiddleware(
  next: Ws.Handler<Ws.Request | Ws.Event, Ws.Response | void>
): Ws.Handler<Ws.Request | Ws.Event, Ws.Response | void> {
  return (request, context) => next(request, context);
}

export function connectMiddleware(next: Ws.Handler<Ws.Event, void>): Ws.Handler<Ws.Event, void> {
  return (request, context) => next(request, context);
}

export function connectHandler() {}
export function disconnectHandler() {}
export function messageHandler() {}
