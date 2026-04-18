# EZ4: Gateway Provider

Gateway providers define a **shared configuration** for all handlers and authorizers that use a given HTTP or WebSocket gateway. Providers allow you to declare environment variables and service bindings that become available to every route handler or authorizer associated with that provider (see [contracts overview](../../../documentation/contracts.md) for more details).

## Provider declaration

A provider is declared by **extending or implementing** one of the following interfaces:

- `Http.Provider` - for HTTP route handlers
- `Http.AuthProvider` - for HTTP authorizers
- `Ws.AuthProvider` - for WebSocket authorizers

Each provider supplies shared variables and services that become available through the handler or authorizer context.

#### Using class (preferred)

```ts
export declare class MyProvider implements Http.Provider {
  services: {
    variables: Environment.ServiceVariables;
    database: Environment.Service<Database>;
  };

  variables: {
    accessKey: Environment.Variable<'SERVICE_ACCESS_KEY'>;
  };
}
```

> The provider class must implement `Http.Provider`, `Http.AuthProvider`, or `Ws.AuthProvider` interface.

#### Using interface

```ts
export interface MyProvider extends Http.Provider {
  services: {
    variables: Environment.ServiceVariables;
    database: Environment.Service<Database>;
  };

  variables: {
    accessKey: Environment.Variable<'SERVICE_ACCESS_KEY'>;
  };
}
```

> The provider interface must extend the base `Http.Provider`, `Http.AuthProvider`, or `Ws.AuthProvider` interface.

## Provider fields

The following fields define shared configuration applied to all handlers and authorizers using this provider.

#### Services

Declares service bindings available to handlers and authorizers using this provider.

- Each entry represents a service that will be injected into the execution context.
- Useful for exposing shared infrastructure or internal services.
- Strongly typed and validated at compile time.

```ts
services: {
  serviceA: Environment.ServiceVariables; // For variables service
  serviceB: Environment.Service<ServiceB>; // For contract service
}
```

> Services allow handlers and authorizers to access shared infrastructure without manually wiring clients or configuration.

#### Variables (optional)

Declares environment variables that apply to every handler and authorizer using this provider.

- Supports both mapped variables and literal values.
- Provider‑level variables should **not** be accessed via `process.env`.
- Accessible through `Environment.ServiceVariables`.

```ts
variables: {
  variableA: Environment.Variable<'ENV_VAR_NAME'>;
  variableB: 'literal value';
}
```

> Provider‑level variables are inherited by all handlers and authorizers using this provider.

## What's next

- [HTTP routes](./http-routes.md)
- [WebSocket routes](./ws-routes.md)
- [Gateway handlers](./gateway-handler.md)
- [Gateway authorizers](./gateway-authorizer.md)
- [Gateway listeners](./gateway-listener.md)
- [Gateway defaults](./gateway-defaults.md)

## License

MIT License
