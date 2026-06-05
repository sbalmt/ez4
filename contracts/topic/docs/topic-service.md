# EZ4: Topic Service

A topic service defines the **publish/subscribe event stream** interface of an application. It bundles together message schema definitions, subscriptions, shared configuration, environment variables, and the generated topic client. A `Topic.Service` is the top‑level contract that EZ4 uses to generate infrastructure, type‑safe clients, and runtime bindings for event delivery and processing.

## Service declaration

A topic service is declared by extending `Topic.Unordered<T>` or `Topic.Ordered<T>` (FIFO) and providing the subscriptions that compose the topic.

```ts
export declare class MyTopic extends Topic.Unordered<MyTopicMessage> {
  subscriptions: [
    Topic.UseSubscription<{
      handler: typeof processMessage;
    }>
  ];
}
```

> Each entry in subscriptions is a fully typed definition created using the `Topic.UseSubscription` type helper.

## Service fields

The following fields define the behavior, configuration, and runtime environment of a topic service.

#### Subscriptions

Defines all subscriptions attached to the topic.

- When multiple subscriptions exist, messages are delivered to all of them according to the cloud provider policy.
- Topic subscriptions are the primary mechanism for processing published messages.
- Each subscription can be either a lambda subscription or a queue subscription.

```ts
subscriptions: [
  Topic.UseSubscription<{
    service: Environment.Service<MyQueueService>;
  }>,

  Topic.UseSubscription<{
    handler: typeof processMessageA;
  }>
];
```

> Use `typeof` since the handler is a type declaration. See the topic [handler](./topic-handler.md) for more details.

#### FIFO Mode (ordered only)

Defines the FIFO mode for ordered topics.

```ts
fifoMode: Topic.UseFifoMode<{
  uniqueId: 'foo';
  groupId: 'bar';
}>;
```

> The given field names must exist in the topic message.

#### Variables (optional)

Declares environment variables that apply to every lambda subscription attached to the topic.

- Supports both mapped variables and literal values.
- Topic service variables should **not** be accessed via `process.env`.
- Accessible through `Environment.ServiceVariables`.

```ts
variables: {
  variableA: Environment.Variable<'ENV_VAR_NAME'>;
  variableB: 'literal value';
}
```

#### Services (optional)

Declares service bindings available to all lambda subscriptions attached to the topic.

- Each entry represents a service that will be injected into the execution context.
- Useful for exposing shared infrastructure or internal services.
- Strongly typed and validated at compile time.

```ts
services: {
  serviceA: Environment.ServiceVariables;
  serviceB: Environment.Service<ServiceB>;
}
```

### Best practices

- Prefer lambda subscriptions for lightweight event handlers and queue subscriptions when you need durable queue processing.
- Use ordered topics only when message ordering is required.

## What's next

- [Topic subscriptions](./topic-subscriptions.md)
- [Topic requests](./topic-requests.md)
- [Topic handlers](./topic-handler.md)
- [Topic listeners](./topic-listener.md)
- [Topic client](./topic-client.md)

## Examples

- [Get started with topic](../../examples/hello-aws-topic)
- [Importing topic](../../examples/aws-import-topic)

## License

MIT License
