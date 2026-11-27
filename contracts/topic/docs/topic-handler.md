# EZ4: Topic Handler

Topic handlers define the **business logic** executed when a function subscription receives an event. A handler receives a fully typed request object, a runtime context, and returns void. Handlers run inside an isolated cloud resource and represent the core execution unit of a topic function subscription.

## Event handler

Use `Topic.Incoming<T>` to access the validated event and delivery metadata.

```ts
export function myHandler(request: Topic.Incoming<MyTopicEvent>, { myClient, myVariables }: Service.Context<MyTopic>): void {
  // Access only the linked context services declared here.
  myClient.doSomething();
  myVariables.myVariable;
}
```

> Parameter destructuring is recommended because EZ4 uses the named bindings to retain only the linked services needed by the handler. Passing an entire context object or spreading it keeps all linked services available.

> Topic handlers use the [topic service](./topic-service.md) context to access linked services and variables.

## Handler middlewares

Function subscriptions can wrap their handler with ordered [middleware](./topic-middleware.md). Middleware runs after validation and immediately before the next middleware or user handler.

> Context references are inferred from parameter destructuring. Destructuring keeps only the named services; accepting the context without destructuring or using a spread keeps all linked services available. Services used only by a [middleware](../../../documentation/middlewares.md) or lifecycle listener must be destructured there as well; otherwise, when they are absent from the handler destructuring, they can be omitted from the bundle.

## Handler listener

Function subscriptions can attach a lifecycle [listener](./topic-listener.md) to observe validation and execution events. Listeners observe execution, while middleware participates in handler execution.

#### Request fields

Handlers receive a typed request object generated from the declared topic event type.

- **Event** - Typed object containing the event payload.
- **Trace Id** - A unique identifier across multiple services.
- **Request Id** - A unique identifier for the request.

All fields are validated and transformed according to the declared topic service schema, as mentioned in the [requests](./topic-requests.md) documentation.

#### Error handling

- Unhandled exceptions thrown by the handler follow the retry semantics of the topic provider.
- Use queue subscriptions for durability and retries when you need durable queue processing.

#### Acknowledgement

- Handlers should be written assuming at‑least‑once delivery, the same event may be delivered more than once.
- Successful enqueueing of the queue subscription results in event acknowledgement.
- Successful completion of the function handler results in event acknowledgement.

## What's next

- [Topic service](./topic-service.md)
- [Topic subscriptions](./topic-subscriptions.md)
- [Topic requests](./topic-requests.md)
- [Topic middlewares](./topic-middleware.md)
- [Topic listener](./topic-listener.md)
- [Topic client](./topic-client.md)

## License

MIT License
