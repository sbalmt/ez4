# EZ4: Queue Middleware

Queue middleware wraps subscription handler execution. A middleware receives the next handler and returns a handler responsible for continuing the chain. Middleware runs after message validation and transformation, immediately before the user handler.

## Middleware implementation

A middleware receives a typed `Queue.Handler<T>` and returns another handler with the same contract.

```ts
export function traceHandler(next: Queue.Handler<MyMessage>): Queue.Handler<MyMessage> {
  return async (request, context) => {
    try {
      // Runs before the next middleware or handler.
      return await next(request, context);
    } finally {
      // Runs after completion, including handler failures.
    }
  };
}
```

Attach middleware functions to the subscription as an ordered tuple:

```ts
Queue.UseSubscription<{
  middlewares: [typeof traceHandler, typeof collectMetrics];
  handler: typeof processMessage;
}>;
```

Use `typeof` because middleware functions are referenced by type.

## Middleware order

Middleware is composed in declaration order. The first entry is the outermost wrapper.

```ts
middlewares: [typeof first, typeof second];
```

Execution proceeds as follows:

```text
first: before
  second: before
    handler
  second: after
first: after
```

## Short-circuiting

A middleware controls whether the next function runs. It can intentionally skip the remaining middleware and user handler by returning without calling `next`.

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

A short-circuited invocation is treated as a successful handler completion and follows the queue acknowledgement rules.

## Errors and lifecycle

Middleware errors are handled like handler errors and can cause the message to be retried.

Use a lifecycle listener for validation errors or other failures that occur before middleware execution. Listener events observe execution; middleware participates in and can change execution.

## What's next

- [Queue service](./queue-service.md)
- [Queue subscriptions](./queue-subscriptions.md)
- [Queue requests](./queue-requests.md)
- [Queue handlers](./queue-handler.md)
- [Queue listeners](./queue-listener.md)
- [Queue client](./queue-client.md)

## License

MIT License
