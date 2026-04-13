# EZ4: Gateway Defaults

Gateway defaults define **global configuration** applied to all HTTP/WS handlers within a gateway service. These defaults allow you to centralize lifecycle behavior, error handling, runtime settings, and resource configuration so that every handler inherits consistent behavior without repeating configuration.

## HTTP declaration

HTTP Defaults are declared using the `Http.UseDefaults` type helper, which uses the `Http.Defaults` interface under the hood.

```ts
export declare class MyServer extends Http.Service {
  defaults: Http.UseDefaults<{
    logRetention: 45;
    logLevel: LogLevel.Debug;
    architecture: ArchitectureType.Arm;
    runtime: RuntimeType.Node24;
    listener: typeof globalListener;
    preferences: {
      namingStyle: NamingStyle.SnakeCase;
    };
    httpErrors: {
      404: [EntryNotFound];
      400: [InvalidInput];
    };
  }>;
}
```

> The defaults type is always an extension of the base `Http.Defaults` interface.

## WS declaration

WebSocket Defaults are declared using the `Ws.UseDefaults` type helper, which uses the `Ws.Defaults` interface under the hood.

```ts
export declare class MyServer extends Ws.Service<WsMessages> {
  defaults: Ws.UseDefaults<{
    logRetention: 45;
    logLevel: LogLevel.Debug;
    architecture: ArchitectureType.Arm;
    runtime: RuntimeType.Node24;
    listener: typeof globalListener;
    preferences: {
      namingStyle: NamingStyle.CamelCase;
    };
  }>;
}
```

> The defaults type is always an extension of the base `Ws.Defaults` interface.

## Defaults fields

#### Listener (optional)

Lifecycle listener for all handlers.

- Runs inside the same cloud resource as the handler.
- Receives events such as request start, request end, and internal transitions.
- Useful for logging, tracing, metrics, and instrumentation.

```ts
listener: typeof globalListener;
```

> Use `typeof` since the route listener is a type declaration.

#### HTTP errors (optional)

Maps exceptions to HTTP status codes.

- Any exception listed here will be translated to the specified status code.
- Unmapped exceptions default to HTTP 500 (Internal Server Error).

```ts
httpErrors: {
  400: [InvalidInputError];
  404: [NotFoundError];
}
```

> [!WARNING]
> Only supported by HTTP services.

#### Preferences (optional)

Defines handler‑specific preference options.

```ts
preferences: {
  namingStyle: NamingStyle.SnakeCase;
}
```

> Use the type helper `Http.UsePreferences` or `Ws.UsePreferences` to get typing suggestions.

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
- Must match supported provider runtimes.

```ts
runtime: RuntimeType.Node24;
```

#### Timeout (optional)

Maximum execution time (in seconds) for the handler.

- Requests exceeding this limit are terminated by the gateway.

```ts
timeout: 29;
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
files: ['icon.png', 'settings.json'];
```

#### Debug (optional)

Enables debug mode for the handler.

- May enable additional logging or diagnostics.
- Behavior depends on the provider and runtime.

```ts
debug: true;
```

## What's next

- [Declare routes](./http-routes.md)
- [Declare requests](./http-requests.md)
- [Declare responses](./http-responses.md)
- [Declare handlers](./gateway-handler.md)
- [Declare authorizers](./gateway-authorizer.md)
- [Declare listeners](./gateway-listener.md)
- [Declare providers](./gateway-provider.md)

## License

MIT License
