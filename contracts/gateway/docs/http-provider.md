# EZ4: Gateway Provider

The HTTP Provider defines shared configuration for all handlers that use a given gateway provider. It allows you to declare environment variables and service bindings that become available to every route and handler associated with that provider.

## Provider declaration

A provider is declared by **extending or implementing** the `Http.Provider` interface and supplying shared variables and services.

#### Using interface

```ts
export interface UserProvider extends Http.Provider {
  services: {
    variables: Environment.ServiceVariables;
    database: Environment.Service<Database>;
  };

  variables: {
    accessKey: Environment.Variable<'SERVICE_ACCESS_KEY'>;
  };
}
```

> The provider interface must always extend the base `Http.Provider` interface.

#### Using class

```ts
export declare class UserProvider implements Http.Provider {
  services: {
    variables: Environment.ServiceVariables;
    database: Environment.Service<Database>;
  };

  variables: {
    accessKey: Environment.Variable<'SERVICE_ACCESS_KEY'>;
  };
}
```

> The provider class must always implement the base `Http.Provider` interface.

## Provider fields

The following fields define shared configuration applied to all handlers using this provider.

#### Services

Declares service bindings available to handlers using this provider.

- Each entry represents a service that will be injected into handlers.
- Useful for exposing shared infrastructure or internal services.

```ts
services: {
  serviceA: Environment.ServiceVariables; // For variables service
  serviceB: Environment.Service<ServiceB>; // For contract service
}
```

> Services allow handlers to access shared infrastructure without manually wiring clients or configuration.

#### Variables (optional)

Declares environment variables that apply to every handler using this provider.

- Supports both mapped variables and literal values.
- Provider‑level variables should not be accessed via `process.env`.
- Accessible through `Environment.ServiceVariables`.

```ts
variables: {
  variableA: Environment.Variable<'ENV_VAR_NAME'>;
  variableB: 'literal value';
}
```

> Provider‑level variables are inherited by all routes unless overridden at the route level.

## License

MIT License
