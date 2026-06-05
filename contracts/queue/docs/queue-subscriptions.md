# EZ4: Queue Subscriptions

Subscriptions represent how a queue consumes messages. Each subscription is fully typed, [reflection‑driven](../../../foundation/reflection/), and declarative. EZ4 uses the subscription declaration to generate the necessary infrastructure, permissions, handler binding plus optional lifecycle listeners, batching, concurrency, and more.

## Subscription declaration

Declare subscriptions using the `Queue.UseSubscription` helper on the service.

```ts
subscriptions: [
  Queue.UseSubscription<{
    listener: typeof queueListener;
    handler: typeof processMessage;
    concurrency: 4;
    timeout: 120;
    batch: 5;
  }>
];
```

## Subscription fields

The following fields define the behavior, infrastructure, and runtime configuration of a queue subscription.

#### Handler

Main entry‑point handler for the processing queue messages.

- Invoked per message in the batch.
- Runs in its own cloud resource.

```ts
handler: typeof processMessage;
```

> Use `typeof` since the message handler is a type declaration. See the queue [handler](./queue-handler.md) for more details.

#### Listener (optional)

Lifecycle listener for the subscription.

- Runs inside the same cloud resource as the subscription handler.
- Receives events such as request begin, request end, and internal transitions.
- Useful for logging, tracing, metrics, and instrumentation.

```ts
listener: typeof queueListener;
```

> Use `typeof` since the subscription listener is a type declaration. See the queue [listener](./queue-listener.md) for more details.

#### Variables (optional)

Declares environment variables associated with the handler.

- Supports both mapped variables and literal values.
- Variables here are only accessible through `process.env`.

```ts
variables: {
  VARIABLE_A: Environment.Variable<'ENV_VAR_NAME'>;
  VARIABLE_B: 'literal value';
}
```

#### Concurrency (optional)

Maximum number of concurrent executions handlers.

```ts
concurrency: 10;
```

#### Batch (optional)

Maximum number of messages per handler invocation.

```ts
batch: 5;
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

#### Memory (optional)

Amount of memory allocated to the handler (in MB).

- Higher memory increases CPU allocation proportionally.
- Useful for compute‑heavy or parallel workloads.

```ts
memory: 128;
```

#### Files (optional)

Additional files to include in the handler bundle.

- Useful for static assets, configuration files, or templates.
- Paths are relative to the project root.

```ts
files: ['data.xml', 'settings.json'];
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

- [Queue service](./queue-service.md)
- [Queue requests](./queue-requests.md)
- [Queue handlers](./queue-handler.md)
- [Queue listeners](./queue-listener.md)
- [Queue client](./queue-client.md)

## License

MIT License
