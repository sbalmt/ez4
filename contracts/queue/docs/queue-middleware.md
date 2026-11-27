# EZ4: Queue Middlewares

Queue middleware wraps subscription handler execution after message validation and transformation. It follows the shared EZ4 [middleware behavior](../../../documentation/middlewares.md).

## Middleware implementation

A middleware receives the next typed `Queue.Handler<T>` and the linked service context, then returns another handler with the same contract.

```ts
export function traceHandler(next: Queue.Handler<MyMessage>, { myClient }: Service.Context<MyQueue>): Queue.Handler<MyMessage> {
  myClient.doSomething();

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

> Context destructuring in the middleware factory determines which linked services are retained. Keep the services used by middleware explicit even when the user handler does not use them.

## Errors and lifecycle

Middleware errors are handled like handler errors and can cause the message to be retried. A short-circuited invocation is treated as a successful handler completion and follows queue acknowledgement rules. Use a lifecycle listener for failures that occur before middleware execution.

## What's next

- [Queue service](./queue-service.md)
- [Queue subscriptions](./queue-subscriptions.md)
- [Queue requests](./queue-requests.md)
- [Queue handlers](./queue-handler.md)
- [Queue listener](./queue-listener.md)
- [Queue client](./queue-client.md)
- [Middlewares overview](../../../documentation/middlewares.md)

## License

MIT License
