# EZ4: Topic Middleware

Topic middleware wraps function subscription handler execution after event validation and transformation. It follows the shared EZ4 [middleware behavior](../../../documentation/middleware.md).

## Middleware implementation

A middleware receives a typed `Topic.Handler<T>` and returns another handler with the same contract.

```ts
export function traceHandler(next: Topic.Handler<MyEvent>): Topic.Handler<MyEvent> {
  return async (request, context) => {
    try {
      return await next(request, context);
    } finally {
      // Record handler execution.
    }
  };
}
```

Attach middleware as an ordered tuple:

```ts
Topic.UseSubscription<{
  middlewares: [typeof traceHandler, typeof collectMetrics];
  handler: typeof processEvent;
}>;
```

## Errors and lifecycle

Middleware errors are handled like handler errors. Returning without calling `next` is treated as successful handler completion. Use a listener for parsing or validation failures that happen before middleware executes.

## What's next

- [Topic service](./topic-service.md)
- [Topic subscriptions](./topic-subscriptions.md)
- [Topic requests](./topic-requests.md)
- [Topic handlers](./topic-handler.md)
- [Topic listeners](./topic-listener.md)
- [Topic client](./topic-client.md)
- [Middleware overview](../../../documentation/middleware.md)

## License

MIT License
