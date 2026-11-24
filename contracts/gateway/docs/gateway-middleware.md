# EZ4: Gateway Middlewares

Gateway middleware wraps HTTP and WebSocket handlers. It follows the shared EZ4 [middleware behavior](../../../documentation/middlewares.md).

## Middleware implementation

HTTP middleware wraps `Http.Handler<T>`:

```ts
export function traceHttp(next: Http.Handler<MyRequest>): Http.Handler<MyRequest> {
  return async (request, context) => {
    try {
      return await next(request, context);
    } finally {
      // Record handler execution.
    }
  };
}
```

WebSocket middleware wraps the matching handler type:

```ts
export function traceMessage(next: Ws.Handler<Ws.Request, Ws.Response | void>) {
  return async (request, context) => next(request, context);
}
```

## Defaults and route middleware

Middleware can be declared in gateway defaults and on an individual HTTP or WebSocket route. Default middleware executes outermost, followed by route middleware:

```text
defaults → route → handler
```

## Authorizers

Gateway authorizers execute in separate resources. Route middleware wraps only the user request/connect/message/disconnect handler and is not applied to authorizers.

## What's next

- [HTTP routes](./http-routes.md)
- [WebSocket routes](./ws-routes.md)
- [Gateway defaults](./gateway-defaults.md)
- [Gateway handlers](./gateway-handler.md)
- [Gateway listener](./gateway-listener.md)
- [Middlewares overview](../../../documentation/middlewares.md)

## License

MIT License
