# EZ4: Gateway Routes

Gateway routes define how HTTP requests are exposed, authorized, processed, and mapped to cloud resources. Each route is fully typed, [reflection‑driven](../../../foundation/reflection/), and declarative. EZ4 uses the route contract to generate the necessary infrastructure, permissions, and API client methods automatically.

## Route declaration

A route is declared using the `Http.UseRoute` type helper, which uses the `Http.Route` type to define the HTTP verb, path, handler, optional authorizer, and additional runtime configuration.

```ts
export declare class MyServer extends Http.Service {
  routes: [
    Http.UseRoute<{
      name: 'getUser';
      path: 'GET /users/{id}';
      listener: typeof userListener;
      authorizer: typeof authorizeHandler;
      handler: typeof getUserHandler;
      cors: true;
      httpErrors: {
        404: [UserNotFound];
        400: [InvalidInput];
      };
    }>
    // ...
  ];
}
```

> The route type is always an extension of the base `Http.Route` interface.

## Route fields

The following fields define the behavior, infrastructure, and runtime configuration of a gateway route.

#### Name

Human‑readable operation name.

- When omitted, the route is excluded from the generated API client.
- Used for documentation (e.g., OpenAPI generation).
- Used to name API client methods.

```ts
name: 'getUser';
```

#### Path

HTTP verb and path for the route.

- Path parameters must be wrapped in `{}`.

```ts
path: 'GET /users/{id}';
```

#### Handler

Main entry‑point handler for the route.

- Runs in its own cloud resource.
- Invoked only after the authorizer (if defined) succeeds.

```ts
handler: typeof getUserHandler;
```

> Use `typeof` since the route handler is a type declaration.

#### Authorizer (optional)

Entry‑point authorization function.

- Runs in a separate cloud resource isolated from the route handler.
- Must complete successfully before the route handler is invoked.
- Can enrich the request with authentication/authorization context.

```ts
authorizer: typeof authorizeHandler;
```

> Use `typeof` since the route authorizer is a type declaration. See the gateway [authorizer](./gateway-authorizer.md) for more details.

#### Listener (optional)

Lifecycle listener for the route.

- Runs inside the same cloud resource as the handler and authorizer.
- Receives events such as request start, request end, and internal transitions.
- Useful for logging, tracing, metrics, and instrumentation.

```ts
listener: typeof userListener;
```

> Use `typeof` since the route listener is a type declaration. See the gateway [listener](./gateway-listener.md) for more details.

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

#### Preferences (optional)

Defines handler‑specific preference options.

```ts
preferences: Http.UsePreferences<{
  namingStyle: NamingStyle.SnakeCase;
}>;
```

> Use the type helper `Http.UsePreferences` to get typing suggestions.

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

> For a better experience with environment variables, use them with a gateway [provider](./gateway-provider.md).

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

#### Disabled (optional)

Disables the route.

- Disabled routes are ignored during deployment.
- No cloud resources are created for them.

```ts
disabled: true;
```

#### CORS (optional)

Enables CORS for the route.

- When enabled, CORS responses include the route's HTTP verb and headers.
- Automatically generates the `OPTIONS` preflight route.

```ts
cors: true;
```

#### VPC (optional)

Enables VPC access for the route.

- Allows the handler to access private resources inside the default VPC.
- May increase cold‑start latency.

```ts
vpc: true;
```

## What's next

- [Declare requests](./http-requests.md)
- [Declare authorizers](./gateway-authorizer.md)
- [Declare providers](./gateway-provider.md)
- [Declare defaults](./gateway-defaults.md)

## License

MIT License
