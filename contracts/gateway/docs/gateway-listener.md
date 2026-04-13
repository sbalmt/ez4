# EZ4: Gateway Listener

Gateway listeners allow you to observe and react to the **lifecycle events** of any HTTP/WS gateway execution. Listeners run alongside handlers and authorizers, receiving typed execution events and contextual information about the gateway environment. Listeners do **not** modify the request or response, they only observe execution flow.

## Listener implementation

A listener is a function that receives a typed service event and a provider context. The event type is defined by `Http.ServiceEvent<T>` or `Ws.ServiceEvent<T>`, where `T` is the request contract type.

```ts
export function myListener(event: Http.ServiceEvent | Ws.ServiceEvent, context: Service.Context<MyServer>) {
  switch (event.type) {
    case ServiceEventType.Begin:
      // Request started
      break;

    case ServiceEventType.Ready:
      // Validation and transformation completed
      break;

    case ServiceEventType.Done:
      // Handler execution completed without error
      break;

    case ServiceEventType.Error:
      // Validation or handler execution error
      break;

    case ServiceEventType.End:
      // Request finished
      break;
  }
}
```

> For global gateway listeners, you can use the gateway contract as the context type.

## Listener events

Listeners receive one or more of the following event types during the lifecycle of a request. All events include a `request` field containing a **partial** version of the incoming request with only the fields available at that stage.

- **Begin** - emitted when the gateway receives a request and begins execution.
- **Ready** - emitted when the gateway has validated the request and is ready to execute the handler.
- **Error** - emitted when an exception occurs during execution (includes the `error` thrown).
- **Done** - emitted when the handler has completed execution successfully.
- **End** - emitted at the end of execution, regardless of success or failure.

## What's next

- [Declare routes](./http-routes.md)

## License

MIT License
