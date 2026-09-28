# EZ4: Gateway Listener

Gateway listeners allow you to observe and react to the **lifecycle events** of any HTTP/WS gateway execution. Listeners run alongside handlers and authorizers, receiving typed execution events and contextual information about the gateway environment. Listeners do **not** modify the request or response, they only observe execution flow.

## Listener implementation

A listener is a function that receives a typed service event and a provider context. The event type is defined by `Http.ServiceEvent<T>` or `Ws.ServiceEvent<T>`, where `T` is the request type.

```ts
export function myListener(event: Http.ServiceEvent | Ws.ServiceEvent, context: Service.Context<MyServer>) {
  switch (event.type) {
    case ServiceEventType.Begin:
      // Request started.
      break;

    case ServiceEventType.Ready:
      // Validation and transformation completed.
      break;

    case ServiceEventType.Done:
      // Handler execution completed without errors.
      break;

    case ServiceEventType.Timeout:
      // Handler execution is timing out and is gonna be aborted.
      break;

    case ServiceEventType.Error:
      // Validation or handler execution error.
      break;

    case ServiceEventType.End:
      // Request finished.
      break;
  }
}
```

> For global gateway listeners, you can use the gateway service as the context provider.

## Listener events

Listeners receive one or more of the following event types during the lifecycle of a request. All events include a `request` field containing a **partial** version of the incoming request with only the fields available at that stage.

- **Begin** - emitted when the gateway receives a request and begins execution.
- **Ready** - emitted when the gateway has validated the request and is ready to execute the handler.
- **Done** - emitted when the handler has completed execution successfully.
- **Timeout** - emitted when the handler has 1 second left before its termination.
- **Error** - emitted when an exception occurs during execution (includes the `error` thrown).
- **End** - emitted at the end of execution, regardless of success or failure.

## Listener failures

Listener failures follow the event's role in the execution lifecycle:

- `Begin` and `Ready` are fail-fast. If either listener event fails, handler execution fails.
- `Done`, `Timeout`, `Error`, and `End` are best-effort notifications. A failure in one of these listener events is logged and does not change the handler result or response.

Listeners should keep best-effort events focused on observability, such as logging, metrics, and tracing. They should not perform required request processing in those events.

## What's next

- [HTTP routes](./http-routes.md)
- [WebSocket routes](./ws-routes.md)
- [Gateway handlers](./gateway-handler.md)
- [Gateway authorizers](./gateway-authorizer.md)
- [Gateway providers](./gateway-provider.md)
- [Gateway defaults](./gateway-defaults.md)

## License

MIT License
