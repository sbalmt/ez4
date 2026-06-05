# EZ4: Topic Subscriptions

Subscriptions represent how a topic delivers messages to processing targets. Each subscription is fully typed, [reflection‑driven](../../../foundation/reflection/), and declarative. EZ4 uses the subscription declaration to generate the necessary infrastructure, invocation bindings, and optional lifecycle listeners.

## Subscription declaration

Declare subscriptions using the `Topic.UseSubscription` helper on the service. Topic subscriptions can be one of two forms.

#### Lambda subscription

A direct lambda subscription invokes a handler whenever the topic receives a matching message.

```ts
Topic.UseSubscription<{
  handler: typeof processMessage;
  listener: typeof topicListener;
}>;
```

#### Queue subscription

A queue subscription forwards topic messages to an existing queue service.

```ts
Topic.UseSubscription<{
  service: Environment.Service<MyQueueService>;
}>;
```

> A subscription cannot be both a lambda subscription and a queue subscription.

## Queue subscription fields

The following fields define the behavior, infrastructure, and runtime configuration of a topic subscription.

#### Service

References an existing queue service that receives topic messages.

- Useful for integrating topic delivery with durable queue processing.
- The referenced queue service must accept the same message type.

```ts
service: Environment.Service<MyQueueService>;
```

## Handler subscription fields

#### Handler

Entry-point handler for processing topic messages.

- Invoked for each incoming message.
- Runs in its own cloud resource.

```ts
handler: typeof processMessage;
```

> See the topic [handler](./topic-handler.md) for more details.

#### Listener (optional)

Lifecycle listener for the subscription.

- Runs inside the same cloud resource as the lambda handler.
- Receives events such as request begin, request end, and internal transitions.
- Useful for logging, tracing, metrics, and instrumentation.

```ts
listener: typeof topicListener;
```

> Use `typeof` since the subscription listener is a type declaration. See the topic [listener](./topic-listener.md) for more details.

#### Variables (optional)

Declares environment variables associated with the subscription.

- Supports both mapped variables and literal values.
- Variables are accessible through the subscription execution context.

```ts
variables: {
  VARIABLE_A: Environment.Variable<'ENV_VAR_NAME'>;
  VARIABLE_B: 'literal value';
}
```

#### Log retention (optional)

Specifies the number of days logs should be retained.

- Applies to the handler's log group.

```ts
logRetention: 90;
```

#### Log level (optional)

Sets the log level for the handler.

- Controls the verbosity of logs emitted by the runtime.

```ts
logLevel: LogLevel.Debug;
```

#### Architecture (optional)

Defines the CPU architecture for the handler.

- ARM architectures may reduce cost and improve performance.
- x86 architectures may be better for heavy workloads.

```ts
architecture: ArchitectureType.Arm;
```

#### Runtime (optional)

Specifies the runtime environment for the handler.

- Determines the Node.js runtime version used.
- Must match supported cloud provider runtimes.

```ts
runtime: RuntimeType.Node24;
```

#### Timeout (optional)

Maximum execution time (in seconds) for the handler.

```ts
timeout: 120;
```

#### Memory (optional)

Amount of memory allocated to the handler (in MB).

- Higher memory increases CPU allocation proportionally.

```ts
memory: 256;
```

#### Files (optional)

Additional files to include in the handler bundle.

- Useful for static assets, configuration files, or templates.
- Paths are relative to the project root.

```ts
files: ['settings.json'];
```

#### Debug (optional)

Enables debug mode for the handler.

- May enable additional logging or diagnostics.
- Behavior depends on the cloud provider and runtime.

```ts
debug: true;
```

#### VPC (optional)

Enables VPC access for the subscription handler.

- Allows the handler to access private resources inside the default VPC.
- May increase cold‑start latency.

```ts
vpc: true;
```

## What's next

- [Topic service](./topic-service.md)
- [Topic requests](./topic-requests.md)
- [Topic handlers](./topic-handler.md)
- [Topic listeners](./topic-listener.md)
- [Topic client](./topic-client.md)

## License

MIT License
