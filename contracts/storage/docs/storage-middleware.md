# EZ4: Storage Middlewares

Storage middleware wraps object-event handler execution after event validation and transformation. It follows the shared EZ4 [middleware behavior](../../../documentation/middlewares.md).

## Middleware implementation

A middleware receives the next typed `Bucket.Handler` and the linked service context, then returns another handler with the same contract.

```ts
export function traceHandler(next: Bucket.Handler, { myClient }: Service.Context<MyStorage>): Bucket.Handler {
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

Attach middleware to the storage event:

```ts
Bucket.UseEvent<{
  path: 'uploads/';
  handler: typeof eventHandler;
  middlewares: [typeof traceHandler];
}>;
```

> Context destructuring in the middleware factory determines which linked services are retained. Keep the services used by middleware explicit even when the user handler does not use them.

## Storage behavior

Middleware errors are handled like event handler errors. Middleware runs only after event validation and transformation. Use a listener for failures occurring before middleware executes.

## What's next

- [Storage service](./storage-service.md)
- [Storage events](./storage-events.md)
- [Storage handlers](./storage-handlers.md)
- [Storage listener](./storage-listener.md)
- [Storage client](./storage-client.md)
- [Middlewares overview](../../../documentation/middlewares.md)

## License

MIT License
