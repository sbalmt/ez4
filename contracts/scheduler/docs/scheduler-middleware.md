# EZ4: Scheduler Middleware

Scheduler middleware wraps target handler execution after event validation and transformation. It follows the shared EZ4 [middleware behavior](../../../documentation/middleware.md).

## Middleware implementation

A middleware receives a typed `Cron.Handler<T>` and returns another handler with the same contract.

```ts
export function traceHandler(next: Cron.Handler<MyEvent>): Cron.Handler<MyEvent> {
  return async (request, context) => {
    try {
      return await next(request, context);
    } finally {
      // Record handler execution.
    }
  };
}
```

Attach middleware to the target:

```ts
target: Cron.UseTarget<{
  handler: typeof eventHandler;
  middlewares: [typeof traceHandler];
}>;
```

## Scheduler behavior

Middleware errors are handled like target handler errors. Middleware runs only after request validation and transformation. Use a listener to observe failures occurring before middleware executes.

## What's next

- [Scheduler service](./scheduler-service.md)
- [Scheduler target](./scheduler-target.md)
- [Scheduler requests](./scheduler-requests.md)
- [Scheduler listener](./scheduler-listener.md)
- [Scheduler client](./scheduler-client.md)
- [Middleware overview](../../../documentation/middleware.md)

## License

MIT License
