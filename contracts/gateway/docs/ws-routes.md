# EZ4: WebSocket Routes

Gateway routes for WebSocket define how real‑time connections are opened, authorized, observed, messaged, and terminated. Each route is fully typed, [reflection‑driven](../../../foundation/reflection/), and declarative. EZ4 uses the route contract to generate the necessary infrastructure, permissions, and client bindings automatically.

## WebSocket declaration

A WebSocket service declares three independent lifecycle routes:

- **Connect** - invoked when a client opens a WebSocket connection.
- **Message** - invoked whenever a message is received from the client.
- **Disconnect** - invoked when the connection is closed.

Each route is declared using the corresponding `Ws.UseConnect`, `Ws.UseMessage`, and `Ws.UseDisconnect` type helpers.

```ts
export declare class MyServer extends Ws.Service<MyMessages> {
  connect: Ws.UseConnect<{
    listener: typeof serverListener;
    authorizer: typeof authorizeHandler;
    handler: typeof connectHandler;
  }>;

  disconnect: Ws.UseDisconnect<{
    listener: typeof serverListener;
    handler: typeof disconnectHandler;
  }>;

  message: Ws.UseMessage<{
    listener: typeof serverListener;
    handler: typeof messageHandler;
  }>;
}
```

> The generic `MyMessages` defines the typed message payloads exchanged over the WebSocket connection.

## Route fields

The following fields define the behavior, infrastructure, and runtime configuration of a gateway route. Unless otherwise noted, fields apply to connect, message, and disconnect routes.

#### Handler

Main entry‑point handler for the route.

- Runs in its own cloud resource.
- For **connect**: invoked once when a new connection is opened and after the authorizer (if defined) succeeds.
- For **disconnect**: invoked when the connection is closed.
- For **message**: invoked for every incoming message.

```ts
handler: typeof routeHandler;
```

> Use `typeof` since the route handler is a type declaration. See the gateway [handler](./gateway-handler.md) for more details.

#### Authorizer (optional, connect only)

Entry‑point authorization for the connect handler.

- Runs in a separate cloud resource isolated from the connect handler.
- Must complete successfully before the connect handler is invoked.
- Can enrich the request with authentication/authorization context.

```ts
authorizer: typeof authorizeHandler;
```

> Use `typeof` since the route authorizer is a type declaration. See the gateway [authorizer](./gateway-authorizer.md) for more details.

#### Listener (optional)

Lifecycle listener for the connect, message, and disconnect handlers (and the authorizer, if defined).

- Runs inside the same cloud resource as the handler and authorizer.
- Receives events such as request begin, request end, and internal transitions.
- Useful for logging, tracing, metrics, and instrumentation.

```ts
listener: typeof serverListener;
```

> Use `typeof` since the route listener is a type declaration. See the gateway [listener](./gateway-listener.md) for more details.

#### Preferences (optional)

Defines handler‑specific preference options.

```ts
preferences: Ws.UsePreferences<{
  namingStyle: NamingStyle.CamelCase;
}>;
```

> Use the type helper `Ws.UsePreferences` to get typing suggestions.

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

#### VPC (optional)

Enables VPC access for the route.

- Allows the handler to access private resources inside the default VPC.
- May increase cold‑start latency.

```ts
vpc: true;
```

## What's next

- [WebSocket requests](./ws-requests.md)
- [WebSocket responses](./ws-responses.md)
- [Gateway handlers](./gateway-handler.md)
- [Gateway authorizers](./gateway-authorizer.md)
- [Gateway listeners](./gateway-listener.md)
- [Gateway providers](./gateway-provider.md)
- [Gateway defaults](./gateway-defaults.md)

## License

MIT License
