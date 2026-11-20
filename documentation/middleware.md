# EZ4: Middleware

Middleware wraps a user handler while preserving the handler's request and context contract. Contracts that support middleware expose an ordered `middlewares` tuple.

## Implementation

A middleware receives the next handler and returns another handler:

```ts
export function traceHandler(next: Queue.Handler<MyMessage>): Queue.Handler<MyMessage> {
  return async (request, context) => {
    try {
      return await next(request, context);
    } finally {
      // Record handler execution.
    }
  };
}
```

Attach middleware by type:

```ts
middlewares: [typeof traceHandler, typeof collectMetrics];
```

## Order

Middleware is composed in declaration order. The first middleware is outermost:

```mermaid
sequenceDiagram
    participant Runtime
    participant First as First middleware
    participant Second as Second middleware
    participant Handler

    Runtime->>First: request, context
    First->>Second: next(request, context)
    Second->>Handler: next(request, context)
    Handler-->>Second: complete or throw
    Second-->>First: complete or throw
    First-->>Runtime: complete or throw
```

Calling `next(request, context)` continues the chain with the same request and context. Middleware may deliberately replace those values before continuing.

## Short-circuiting

Middleware owns whether the next handler runs. Returning without calling `next` short-circuits the remaining middleware and the user handler.

```ts
export function rejectDuplicates(next: Queue.Handler<MyMessage>): Queue.Handler<MyMessage> {
  return async (request, context) => {
    if (await isDuplicate(request.message, context)) {
      return;
    }

    await next(request, context);
  };
}
```

The result of a short-circuited handler depends on the contract's normal successful-completion semantics.

## Errors

Middleware runs after contract validation and transformation. Middleware errors are handled like user-handler errors by the surrounding contract.

Use middleware to wrap user-handler execution. Use a lifecycle listener to observe earlier failures, such as request parsing or validation, and later lifecycle transitions.

```mermaid
sequenceDiagram
    participant Runtime
    participant Listener
    participant Middleware
    participant Handler

    Runtime->>Listener: Begin
    Runtime->>Runtime: Parse and validate
    Runtime->>Listener: Ready
    Runtime->>Middleware: Invoke
    Middleware->>Handler: next(request, context)
    Handler-->>Middleware: Complete or throw
    Middleware-->>Runtime: Complete or throw
    Runtime->>Listener: Done or Error
    Runtime->>Listener: End
```

## What's next

- [Quick start](./quick-start.md)
- [Configuration](./configuration.md)
- [Deployment overview](./deployment.md)
- [Contracts overview](./contracts.md)
- [Listener overview](./listener.md)
- [Architecture overview](./architecture.md)
- [Philosophy](./philosophy.md)

## License

MIT License
