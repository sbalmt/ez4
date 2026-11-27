# EZ4: Topic Middlewares

Topic middleware wraps function subscription handler execution after event validation and transformation. It follows the shared EZ4 [middleware behavior](../../../documentation/middlewares.md).

## Middleware implementation

A middleware receives the next typed `Topic.Handler<T>` and the linked service context, then returns another handler with the same contract.

```ts
export function traceHandler(next: Topic.Handler<MyEvent>, { myClient }: Service.Context<MyTopic>): Topic.Handler<MyEvent> {
  myClient.doSomething();

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

> Context destructuring in the middleware factory determines which linked services are retained. Keep the services used by middleware explicit even when the user handler does not use them.

## Errors and lifecycle

Middleware errors are handled like handler errors. Returning without calling `next` is treated as successful handler completion. Use a listener for parsing or validation failures that happen before middleware executes.

## What's next

- [Topic service](./topic-service.md)
- [Topic subscriptions](./topic-subscriptions.md)
- [Topic requests](./topic-requests.md)
- [Topic handlers](./topic-handler.md)
- [Topic listener](./topic-listener.md)
- [Topic client](./topic-client.md)
- [Middlewares overview](../../../documentation/middlewares.md)

## License

MIT License
