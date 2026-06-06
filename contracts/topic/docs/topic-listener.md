# EZ4: Topic Listener

Topic listeners let you observe the **lifecycle events** of subscription execution. Listeners run alongside handlers and receive typed execution events and contextual information about the topic environment. Listeners do **not** modify the request, they only observe execution flow.

## Listener implementation

Listeners receive typed service event `Topic.ServiceEvent<T>` where `T` is the topic message type.

```ts
export function topicListener(event: Topic.ServiceEvent<MyTopicMessage>, context: Service.Context<MyTopic>) {
  switch (event.type) {
    case ServiceEventType.Begin:
      // Message processing started.
      break;

    case ServiceEventType.Ready:
      // Message validation and transformation completed.
      break;

    case ServiceEventType.Done:
      // Message processing completed successfully.
      break;

    case ServiceEventType.Error:
      // Message validation or handler execution error.
      break;

    case ServiceEventType.End:
      // Message processing finished.
      break;
  }
}
```

See [topic subscriptions](./topic-subscriptions.md) for how to attach listeners to subscriptions.

## Listener events

Listeners receive one or more of the following event types during the lifecycle of a request. All events include a `request` field containing a **partial** version of the incoming request with only the fields available at that stage.

- **Begin** - emitted when the topic receives a message and begins processing.
- **Ready** - emitted when validation and transformation are complete for the incoming message.
- **Done** - emitted when the handler completes successfully.
- **Error** - emitted when validation or handler execution throws an exception.
- **End** - emitted at the end of processing, regardless of success or failure.

## What's next

- [Topic service](./topic-service.md)
- [Topic subscriptions](./topic-subscriptions.md)
- [Topic requests](./topic-requests.md)
- [Topic handlers](./topic-handler.md)
- [Topic client](./topic-client.md)

## License

MIT License
