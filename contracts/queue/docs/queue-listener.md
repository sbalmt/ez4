# EZ4: Queue Listener

Listeners let you observe the **lifecycle events** of subscription handler execution. Listeners run alongside handlers and receive typed execution events and contextual information about the queue environment. Listeners do **not** modify the request, they only observe execution flow.

## Listener implementation

Listeners receive typed service event `Queue.ServiceEvent<T>` where `T` is the queue message type.

```ts
export function myListener(event: Queue.ServiceEvent<MyMessage>, context: Service.Context<MyQueue>) {
  switch (event.type) {
    case ServiceEventType.Begin:
      // Message batch processing started.
      break;

    case ServiceEventType.Ready:
      // Current message validation and transformation completed.
      break;

    case ServiceEventType.Done:
      // Handler completed without throwing for the current message.
      break;

    case ServiceEventType.Timeout:
      // Handler execution is timing out and is gonna be aborted.
      break;

    case ServiceEventType.Error:
      // Current message validation or handler execution error.
      break;

    case ServiceEventType.End:
      // Message batch processing finished.
      break;
  }
}
```

See [queue-subscriptions](./queue-subscriptions.md) for how to attach listeners to subscriptions.

## Listener events

Listeners receive one or more of the following event types during the lifecycle of a request. All events include a `request` field containing a **partial** version of the incoming request with only the fields available at that stage.

- **Begin** - emitted when the queue receives messages and the subscription handler begins processing.
- **Ready** - emitted when validation and transformation are complete for the message the handler is about to run.
- **Done** - emitted when the handler returns successfully for the current message.
- **Timeout** - emitted when the handler has 1 second left before its termination.
- **Error** - emitted when validation or handler execution throws an exception.
- **End** - emitted at the end of processing, regardless of success or failure.

> A handler-requested retry still counts as a successful handler completion and does not imply message acknowledgement.

## Listener failures

Listener failures follow the event's role in the execution lifecycle:

- `Begin` and `Ready` are fail-fast. If either listener event fails, the affected queue processing fails and the message or batch can be retried.
- `Done`, `Timeout`, `Error`, and `End` are best-effort notifications. A failure in one of these listener events is logged and does not change message processing or acknowledgement.

Listeners should keep best-effort events focused on observability, such as logging, metrics, and tracing. They should not perform required message processing in those events.

## What's next

- [Queue service](./queue-service.md)
- [Queue subscriptions](./queue-subscriptions.md)
- [Queue requests](./queue-requests.md)
- [Queue handlers](./queue-handler.md)
- [Queue client](./queue-client.md)

## License

MIT License
