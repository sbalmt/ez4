# EZ4: Scheduler Middlewares

Scheduler middleware wraps target handler execution after event validation and transformation. It follows the shared EZ4 [middleware behavior](../../../documentation/middlewares.md).

## Middleware implementation

A middleware receives the next typed `Cron.Handler<T>` and the linked service context, then returns another handler with the same contract.

```ts
export function traceHandler(next: Cron.Handler<MyEvent>, { myClient }: Service.Context<MyScheduler>): Cron.Handler<MyEvent> {
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

Attach middleware to the target:

```ts
target: Cron.UseTarget<{
  handler: typeof eventHandler;
  middlewares: [typeof traceHandler];
}>;
```

> Context destructuring in the middleware factory determines which linked services are retained. Keep the services used by middleware explicit even when the user handler does not use them.

## Scheduler behavior

Middleware errors are handled like target handler errors. Middleware runs only after request validation and transformation. Use a listener to observe failures occurring before middleware executes.

## What's next

- [Scheduler service](./scheduler-service.md)
- [Scheduler target](./scheduler-target.md)
- [Scheduler requests](./scheduler-requests.md)
- [Scheduler listener](./scheduler-listener.md)
- [Scheduler client](./scheduler-client.md)
- [Middlewares overview](../../../documentation/middlewares.md)

## License

MIT License
