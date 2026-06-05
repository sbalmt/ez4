# EZ4: Queue Listener

Listeners let you observe the **lifecycle events** of subscription handler execution. Listeners run alongside handlers and receive typed execution events and contextual information about the queue environment. Listeners do **not** modify the request, they only observe execution flow.

## Listener implementation

Listeners receive typed service event `Queue.ServiceEvent<T>` where `T` is the message contract type.

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
      // Current message processing completed successfully.
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
- **Done** - emitted when the handler completes successfully the message processing.
- **Error** - emitted when validation or handler execution throws an exception.
- **End** - emitted at the end of processing, regardless of success or failure.

## What's next

- [Queue service](./queue-service.md)
- [Queue subscriptions](./queue-subscriptions.md)
- [Queue requests](./queue-requests.md)
- [Queue handlers](./queue-handler.md)

## License

MIT License
