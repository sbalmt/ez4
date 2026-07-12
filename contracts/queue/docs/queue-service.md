# EZ4: Queue Service

A queue service defines the **asynchronous message processing** interface of an application. It bundles together schema definitions, subscriptions, shared configuration, environment variables, and the generated queue client. A `Queue.Service` is the top‑level contract that EZ4 uses to generate infrastructure, type‑safe clients, and runtime bindings for background processing.

## Service declaration

A queue service is declared by extending `Queue.Unordered<T>` or `Queue.Ordered<T>` (FIFO) and providing the subscriptions that compose the queue.

```ts
declare class MyMessage implements Queue.Message {
  foo: number;
  bar: boolean;
}

export declare class MyQueue extends Queue.Unordered<MyMessage> {
  subscriptions: [
    Queue.UseSubscription<{
      handler: typeof processMessage;
    }>
  ];
}
```

> Each entry in subscriptions is a fully typed definition created using the `Queue.UseSubscription` type helper.

## Service fields

The following fields define the behavior, configuration, and runtime environment of a queue service.

#### Subscriptions

Defines all subscription attached to the queue.

- When multiple subscriptions exist, messages are delivered to one of them according to the cloud provider routing policy.
- Each subscription declares a handler, optional listener, batch, concurrency and other options.

```ts
subscriptions: [
  Queue.UseSubscription<{
    handler: typeof processMessageA;
    batch: 15;
  }>,

  Queue.UseSubscription<{
    handler: typeof processMessageB;
    concurrency: 2;
  }>
];
```

> Use `typeof` because the handler is referenced by type. See the queue [handler](./queue-handler.md) for more details.

#### Dead Letter (optional)

Optional dead‑letter configuration to route failing messages for inspection and retries.

```ts
deadLetter: Queue.UseDeadLetter<{
  maxRetries: 3; // 3 retries before going to DLQ.
  retention: 60; // 1 hour retention.
}>;
```

#### FIFO Mode (ordered only)

Defines the FIFO mode for ordered queues.

```ts
fifoMode: Queue.UseFifoMode<{
  uniqueId: 'foo'; // Optionally specify the deduplication field name.
  groupId: 'bar'; // Specify the group field name.
}>;
```

> The given field names must exist in the queue message.

#### Fair Mode (optional, unordered only)

Defines the fair mode for unordered queues.

```ts
fairMode: Queue.UseFairMode<{
  groupId: 'bar'; // Specify the group field name.
}>;
```

> The given group Id must exist in the queue message.

#### Backoff (optional)

Defines the minimum and maximum delays for the retry behavior of the queue. The backoff can be combined with the `deadLetter` configuration.

- Each retry has the delay increased based on the current attempt and the maximum number attempts.
- In the first retry the delay time is close to the minimum amount specified.
- In the last retry the delay is close to the maximum amount specified.

```ts
backoff: Queue.UseBackoff<{
  minDelay: 5;
  maxDelay: 20;
}>;
```

#### Delay (optional)

Default message delay (in seconds) for messages sent to the queue.

```ts
delay: 30;
```

#### Polling (optional)

Default long‑polling wait time (in seconds) used by the queue runtime.

```ts
polling: 20;
```

#### Retention (optional)

Maximum retention time (in minutes) for all messages in the queue.

```ts
retention: 60;
```

#### Timeout (optional)

Maximum acknowledge time (in seconds) for the handler.

```ts
timeout: 90;
```

#### Services (optional)

Declares service bindings available to all subscription handlers attached to the queue.

- Each entry represents a service that will be injected into the execution context.
- Useful for exposing shared infrastructure or internal services.
- Strongly typed and validated at compile time.

```ts
services: {
  serviceA: Environment.ServiceVariables; // For variables service
  serviceB: Environment.Service<ServiceB>; // For contract service
}
```

#### Variables (optional)

Declares environment variables that apply to every handler attached to the queue.

- Supports both mapped variables and literal values.
- Queue service variables should **not** be accessed via `process.env`.
- Accessible through `Environment.ServiceVariables`.

```ts
variables: {
  variableA: Environment.Variable<'ENV_VAR_NAME'>;
  variableB: 'literal value';
}
```

### Best practices

- Use dead-letter queues to investigate poison messages rather than adding broad try/catch logic to handlers.
- Prefer unordered/fair mode for high throughput, ordered mode only where ordering matters.

## What's next

- [Queue subscriptions](./queue-subscriptions.md)
- [Queue requests](./queue-requests.md)
- [Queue handlers](./queue-handler.md)
- [Queue listeners](./queue-listener.md)
- [Queue client](./queue-client.md)

## Examples

- [Get started with queue](../../examples/hello-aws-queue)
- [Importing queue](../../examples/aws-import-queue)

## License

MIT License
