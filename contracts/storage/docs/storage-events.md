# EZ4: Storage Events

Storage events describe object changes that trigger handlers when a bucket receives an object event. Each event matches object keys by path and can reference a handler and lifecycle listener.

## Event declaration

Declare events using the `Bucket.UseEvent` helper on the storage service.

```ts
events: [
  Bucket.UseEvent<{
    path: 'uploads/*.ext';
    handler: typeof eventHandler;
    listener: typeof eventListener;
  }>
];
```

## Event fields

#### Path

Defines the object-key pattern that triggers the event. A path can match a prefix, or split the match into a prefix and suffix with `*`.

```ts
path: 'uploads/*.ext';
```

> The `*` wildcard matches the middle of an object key. In `uploads/*.ext`, the key must start with `uploads/` and end with `.ext`.

#### Handler

Main entry-point function for processing matching object events.

- Invoked when an object matches the event path.
- Runs in its own cloud resource.

```ts
handler: typeof eventHandler;
```

> Use `typeof` because the event handler is referenced by type. See [Storage handlers](./storage-handlers.md) for the handler implementation.

#### Listener (optional)

Lifecycle listener for the event handler.

- Runs alongside the event handler.
- Receives request lifecycle transitions for logging, tracing, metrics, and instrumentation.

```ts
listener: typeof eventListener;
```

> Use `typeof` because the event listener is referenced by type. See [Storage listener](./storage-listener.md) for listener details.

## Event handler fields

The following fields define the runtime configuration for the handler attached to each event.

#### Variables (optional)

Declares environment variables available to the event handler.

- Supports both mapped variables and literal values.
- During metadata build, `Environment.Variable<'NAME'>` must resolve to a non-empty value.
- Use `Environment.VariableOrValue<'NAME', Default>` to fallback to `Default` when the environment variable is missing.
- Variables here are only accessible through `process.env`.

```ts
variables: {
  VARIABLE_A: Environment.Variable<'ENV_VAR_NAME'>;
  VARIABLE_B: 'literal value';
}
```

Event variables are available to the handler through `process.env`.

#### Log retention (optional)

Specifies the number of days logs should be retained.

- Applies to the handler's log group.

```ts
logRetention: 90;
```

#### Log level (optional)

Sets the handler log level.

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

Sets the handler memory allocation in megabytes.

- Higher memory increases CPU allocation proportionally.
- Useful for compute-heavy or parallel workloads.

```ts
memory: 128;
```

#### Files (optional)

Includes additional files in the handler bundle. Paths are relative to the project root.

- Useful for static assets, configuration files, or templates.

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

Enables VPC access for the event handler.

- Allows the handler to access private resources inside the default VPC.
- May increase cold-start latency.

```ts
vpc: true;
```

#### Timeout (optional)

Sets the maximum handler execution time in seconds.

- The handler must complete within this timeout window.

```ts
timeout: 120;
```

## What's next

- [Storage service](./storage-service.md)
- [Storage handlers](./storage-handlers.md)
- [Storage client](./storage-client.md)
- [Storage listener](./storage-listener.md)

## License

MIT License
