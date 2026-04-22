# EZ4: WebSocket Service

A WebSocket service defines the **full real‑time interface** of an application. It bundles together the connect, message, and disconnect routes, along with shared configuration, environment variables, and the generated WebSocket client. A `Ws.Service` is the top‑level contract that EZ4 uses to generate infrastructure, type‑safe clients, and runtime bindings.

## Service declaration

A WebSocket service is declared by extending the `Ws.Service` abstract class and providing the required lifecycle routes.

```ts
export declare class MyServer extends Ws.Service<MyMessages> {
  name: 'WS Service';

  stage: 'stream';

  connect: Ws.UseConnect<{
    handler: typeof connectHandler;
  }>;

  disconnect: Ws.UseDisconnect<{
    handler: typeof disconnectHandler;
  }>;

  message: Ws.UseMessage<{
    handler: typeof messageHandler;
  }>;
}
```

> The generic `MyMessages` defines the full schema of all inbound and outbound message payloads.

## Service fields

The following fields define the behavior, configuration, and runtime environment of a WebSocket service.

#### Connect

Defines the connect route for the service.

- Does not return a response body.
- Invoked when a new connection is opened.
- May include a gateway [authorizer](./gateway-authorizer.md).
- Receives a typed WS [event](./ws-events.md).

```ts
connect: Ws.UseConnect<{
  handler: typeof connectHandler;
}>;
```

> Use `typeof` since the handler is a type declaration. See the gateway [handler](./gateway-handler.md) for more details.

#### Disconnect

Defines the disconnect route for the service.

- Invoked when the connection is closed.
- Receives a typed WS [event](./ws-events.md) with a copy of the headers/query captured during connect.
- Does not return a response body.

```ts
disconnect: Ws.UseDisconnect<{
  handler: typeof disconnectHandler;
}>;
```

> Use `typeof` since the handler is a type declaration. See the gateway [handler](./gateway-handler.md) for more details.

#### Message

Defines the message route for the service.

- Invoked for every incoming message.
- Optionally returns a typed WS [response](./ws-responses.md).
- Receives a typed WS [request](./ws-requests.md).

```ts
message: Ws.UseMessage<{
  handler: typeof messageHandler;
}>;
```

> Use `typeof` since the handler is a type declaration. See the gateway [handler](./gateway-handler.md) for more details.

#### Name (optional)

Human‑readable display name for the service.

- Used in documentation.
- Used in generated client metadata.
- Optional but recommended.

```ts
name: 'WS Service';
```

#### Stage (optional)

Base path prefix for the WebSocket.

- Does not affect message routing, only the connection URL.
- Useful for grouping environments (e.g., `dev`, `prd`) or namespacing multiple services.
- Prepended to the WebSocket endpoint URL.

```ts
stage: 'stream';
```

> A service with the domain `api.com` and stage `stream` will expose its endpoint at `wss://api.com/stream`.

#### Defaults (optional)

Defines default configuration applied to all routes in the service and may include:

- Payload naming preferences.
- Runtime, Architecture and VPC settings.
- Memory and timeout values.
- Logging configuration.

```ts
defaults: Ws.UseDefaults<{
  logLevel: LogLevel.Debug;
  architecture: ArchitectureType.Arm;
  runtime: RuntimeType.Node24;
}>;
```

> See the gateway [defaults](./gateway-defaults.md) for more details.

#### Services (optional)

Declares service bindings available to all handlers using the WS service as its context provider.

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

Declares environment variables that apply to every handler using the WS service as its context provider.

- Supports both mapped variables and literal values.
- Provider‑level variables should **not** be accessed via `process.env`.
- Accessible through `Environment.ServiceVariables`.

```ts
variables: {
  variableA: Environment.Variable<'ENV_VAR_NAME'>;
  variableB: 'literal value';
}
```

## What's next

- [WebSocket routes](./ws-routes.md)
- [WebSocket events](./ws-events.md)
- [WebSocket requests](./ws-requests.md)
- [WebSocket responses](./ws-responses.md)
- [Gateway handlers](./gateway-handler.md)
- [Gateway authorizers](./gateway-authorizer.md)
- [Gateway listeners](./gateway-listener.md)
- [Gateway providers](./gateway-provider.md)
- [Gateway defaults](./gateway-defaults.md)

## License

MIT License
