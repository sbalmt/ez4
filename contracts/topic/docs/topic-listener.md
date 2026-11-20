# EZ4: Topic Listener

Topic listeners observe the lifecycle of function subscription execution. They receive typed events and topic service context and follow the shared EZ4 [listener behavior](../../../documentation/listener.md).

## Listener implementation

Listeners receive typed service event `Topic.ServiceEvent<T>` where `T` is the topic event type.

```ts
export function topicListener(event: Topic.ServiceEvent<MyTopicEvent>, context: Service.Context<MyTopic>) {
  switch (event.type) {
    case ServiceEventType.Begin:
      // Event processing started.
      break;

    case ServiceEventType.Ready:
      // Event validation and transformation completed.
      break;

    case ServiceEventType.Done:
      // Event processing completed successfully.
      break;

    case ServiceEventType.Timeout:
      // Event execution is timing out and is gonna be aborted.
      break;

    case ServiceEventType.Error:
      // Event validation or handler execution error.
      break;

    case ServiceEventType.End:
      // Event processing finished.
      break;
  }
}
```

See [topic subscriptions](./topic-subscriptions.md) for how to attach listeners to subscriptions.

## Listener events

Listeners receive one or more of the following event types during the lifecycle of a request. All events include a `request` field containing a **partial** version of the incoming request with only the fields available at that stage.

- **Begin** - emitted when the topic receives an event and begins processing.
- **Ready** - emitted when validation and transformation are complete for the incoming event.
- **Done** - emitted when the handler completes successfully.
- **Timeout** - emitted when the handler has 1 second left before its termination.
- **Error** - emitted when validation or handler execution throws an exception.
- **End** - emitted at the end of processing, regardless of success or failure.

## Topic-specific behavior

Fail-fast listener errors stop topic processing and allow the delivery to be retried. Best-effort listener errors do not change the topic delivery outcome.

## What's next

- [Topic service](./topic-service.md)
- [Topic subscriptions](./topic-subscriptions.md)
- [Topic requests](./topic-requests.md)
- [Topic handlers](./topic-handler.md)
- [Topic middleware](./topic-middleware.md)
- [Topic client](./topic-client.md)
- [Listener overview](../../../documentation/listener.md)

## License

MIT License
