# EZ4: Gateway Routes

Gateway routes define how HTTP requests are exposed, authorized, processed, and mapped to cloud resources. Each route is fully typed, [reflection‑driven](../../../foundation/reflection/), and declarative. EZ4 uses the route contract to generate the necessary infrastructure, permissions, and API client methods automatically.

## Route declaration

A route is described using the `Http.Route` interface, which defines the HTTP verb, path, handler, optional authorizer, and additional runtime configuration.

```ts
type UserRoute = Http.UseRoute<{
  name: 'getUser';
  path: 'GET /users/{id}';
  authorizer: authorizeHandler;
  handler: getUserHandler;
  cors: true;
  httpErrors: {
    404: [UserNotFound];
    400: [InvalidInput];
  };
}>;
```

> Your route is always an extension of the base `Http.Route` interface.

## Route fields

#### name

Human‑readable operation name.

- When omitted, the route is excluded from the generated API client.
- Used for documentation (e.g., OpenAPI generation).
- Used to name API client methods.

```ts
name: 'getUser';
```

#### path

HTTP verb and path for the route.

- Path parameters must be wrapped in `{}`.

```ts
path: 'GET /users/{id}';
```

#### handler

Main entry‑point handler for the route.

- Runs in its own cloud resource.
- Invoked only after the authorizer (if defined) succeeds.

```ts
handler: getUserHandler;
```

#### authorizer (optional)

Entry‑point authorization function.

- Runs in a separate cloud resource isolated from the route handler.
- Must complete successfully before the route handler is invoked.
- Can enrich the request with authentication/authorization context.

```ts
authorizer: authorizeHandler;
```

#### listener (optional)

Lifecycle listener for the route.

- Runs inside the same cloud resource as the route handler.
- Receives events such as request start, request end, and internal transitions.
- Useful for logging, tracing, metrics, and instrumentation.

```ts
listener: userRouteListener;
```

#### httpErrors (optional)

Maps exceptions to HTTP status codes.

- Any exception listed here will be translated to the specified status code.
- Unmapped exceptions default to HTTP 500 (Internal Server Error).

```ts
httpErrors: {
  400: [InvalidInputError],
  404: [NotFoundError]
}
```

#### disabled (optional)

Disables the route.

- Disabled routes are ignored during deployment.
- No cloud resources are created for them.

```ts
disabled: true;
```

#### cors (optional)

Enables CORS for the route.

- When enabled, CORS responses include the route's HTTP verb and headers.

```ts
cors: true;
```

#### vpc (optional)

Enables VPC access for the route.

- Allows the handler to access private resources inside the default VPC.
- May increase cold‑start latency.

```ts
vpc: true;
```

## License

MIT License
