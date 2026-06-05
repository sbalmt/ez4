# EZ4: Scheduler Target

Scheduler targets define the **execution configuration** for scheduled events. The target declaration attached to `Cron.Service` controls the handler, listener, and runtime options used for each event invocation.

## Target declaration

A scheduler target is declared using `Cron.UseTarget` inside the scheduler service.

```ts
target: Cron.UseTarget<{
  handler: typeof eventHandler;
  listener: typeof schedulerListener;
  timeout: 30;
}>;
```

## Target fields

#### Handler

Defines the entry-point function for scheduled events.

- Invoked every time a scheduler event is triggered.
- Runs in its own cloud resource.

```ts
handler: typeof eventHandler;
```

#### Listener (optional)

Defines an optional listener that observes scheduler execution events.

- Runs inside the same cloud resource as the target handler.
- Receives events such as request begin, request end, and internal transitions.
- Useful for logging, tracing, metrics, and instrumentation.

```ts
listener: typeof schedulerListener;
```

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

Enables VPC access for the scheduler handler.

- Allows the handler to access private resources inside the default VPC.
- May increase cold‑start latency.

```ts
vpc: true;
```

## What's next

- [Scheduler service](./scheduler-service.md)
- [Scheduler requests](./scheduler-requests.md)
- [Scheduler listener](./scheduler-listener.md)
- [Scheduler client](./scheduler-client.md)

## License

MIT License
