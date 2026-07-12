# EZ4: Topic Handler

Topic handlers define the **business logic** executed when a lambda subscription receives a message. A handler receives a fully typed request object, a runtime context, and returns void. Handlers run inside an isolated cloud resource and represent the core execution unit of a topic lambda subscription.

## Message handler

```ts
export function myHandler(request: Topic.Incoming<MyTopicMessage>, context: Service.Context<MyTopic>): void {
  const { message } = request;

  // Business logic here.
}
```

> Topic handlers use the topic service as their context provider.

#### Request fields

Handlers receive a typed request object generated from the declared topic message type.

- **Message** - Typed object containing the message payload.
- **Trace Id** - A unique identifier across multiple services.
- **Request Id** - A unique identifier for the request.

All fields are validated and transformed according to the declared topic service schema, as mentioned in the [requests](./topic-requests.md) documentation.

#### Error handling

- Unhandled exceptions thrown by the handler follow the retry semantics of the topic provider.
- Use queue subscriptions for durability and retries when you need durable queue processing.

#### Acknowledgement

- Handlers should be written assuming at‑least‑once delivery, the same message may be delivered more than once.
- Successful enqueueing of the queue subscription results in message acknowledgement.
- Successful completion of the lambda handler results in message acknowledgement.

## What's next

- [Topic service](./topic-service.md)
- [Topic subscriptions](./topic-subscriptions.md)
- [Topic requests](./topic-requests.md)
- [Topic listeners](./topic-listener.md)
- [Topic client](./topic-client.md)

## License

MIT License
