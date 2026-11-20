# EZ4: Storage Middleware

Storage middleware wraps object-event handler execution after event validation and transformation. It follows the shared EZ4 [middleware behavior](../../../documentation/middleware.md).

## Middleware implementation

A middleware receives a typed `Bucket.Handler` and returns another handler with the same contract.

```ts
export function traceHandler(next: Bucket.Handler): Bucket.Handler {
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

## Storage behavior

Middleware errors are handled like event handler errors. Middleware runs only after event validation and transformation. Use a listener for failures occurring before middleware executes.

## What's next

- [Storage service](./storage-service.md)
- [Storage events](./storage-events.md)
- [Storage handlers](./storage-handlers.md)
- [Storage listener](./storage-listener.md)
- [Storage client](./storage-client.md)
- [Middleware overview](../../../documentation/middleware.md)

## License

MIT License
