# EZ4: HTTP Service

An HTTP service defines the **full HTTP interface** of an application. It bundles together all gateway routes, shared configuration, CORS rules, caching behavior, access logging, environment variables, and the generated HTTP client. A `Http.Service` is the top‑level contract that EZ4 uses to generate infrastructure, type‑safe clients, and runtime bindings.

## Service declaration

An HTTP service is declared by extending the `Http.Service` abstract class and providing the list of routes that compose the gateway.

```ts
export declare class MyServer extends Http.Service {
  name: 'HTTP Service';

  routes: [
    Http.UseRoute<{
      name: 'getHello';
      path: 'GET /hello';
      handler: typeof routeHandler;
    }>
  ];
}
```

> Each entry in routes is a fully typed HTTP route definition created using the `Http.UseRoute` type helper.

## Service fields

The following fields define the behavior, configuration, and runtime environment of an HTTP service.

#### Routes

Defines all HTTP routes associated with the gateway.

- Each route specifies its method, path, handler, and optional authorizer.
- Used to generate infrastructure and the type‑safe HTTP client.
- Routes are validated and transformed at compile time.

```ts
routes: [
  Http.UseRoute<{
    name: 'getHello';
    path: 'GET /hello';
    handler: typeof routeHandler;
  }>
];
```

> Use `typeof` since the handler is a type declaration. See the http [routes](./http-routes.md) and gateway [handler](./gateway-handler.md) for more details.

#### Name (optional)

Human‑readable display name for the service.

- Used in documentation.
- Used in generated client metadata.
- Optional but recommended.

```ts
name: 'HTTP Service';
```

#### Defaults (optional)

Defines default configuration applied to all routes in the service and may include:

- Payload naming preferences.
- Runtime, Architecture and VPC settings.
- Memory and timeout values.
- Logging configuration.

```ts
defaults: Http.UseDefaults<{
  logLevel: LogLevel.Debug;
  architecture: ArchitectureType.Arm;
  runtime: RuntimeType.Node24;
}>;
```

> See the gateway [defaults](./gateway-defaults.md) for more details.

#### CORS (optional)

Defines the CORS configuration applied to all routes.

- Controls allowed origins, headers, and methods.
- Applied automatically to preflight and actual requests.

```ts
cors: Http.UseCors<{
  allowOrigins: ['*'];
  allowHeaders: ['content-type'];
  allowMethods: ['GET', 'POST'];
}>;
```

> Enable `cors` in the route to automatically include authorization headers and route method.

#### Cache (optional)

Defines caching behavior for authorizers.

- Improves performance for authenticated routes.
- Reduces repeated authorizer invocations.

```ts
cache: Http.UseCache<{
  authorizerTTL: 300; // seconds
}>;
```

#### Access (optional)

Defines access logging configuration for the service.

- Useful for auditing and observability.
- Controls log retention.

```ts
access: Http.UseAccess<{
  logRetention: 2;
}>;
```

#### Services (optional)

Declares service bindings available to all handlers using the HTTP service as its context provider.

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

Declares environment variables that apply to every handler using the HTTP service as its context provider.

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

- [HTTP routes](./http-routes.md)
- [HTTP events](./http-events.md)
- [HTTP requests](./http-requests.md)
- [HTTP responses](./http-responses.md)
- [Gateway handlers](./gateway-handler.md)
- [Gateway authorizers](./gateway-authorizer.md)
- [Gateway listeners](./gateway-listener.md)
- [Gateway providers](./gateway-provider.md)
- [Gateway defaults](./gateway-defaults.md)

## License

MIT License
