# EZ4: Database Middleware

Database middleware wraps table stream handler execution after stream request validation and transformation. It follows the shared EZ4 [middleware behavior](../../../documentation/middleware.md).

## Middleware implementation

A middleware receives a typed `Database.Handler<T>` and returns another handler with the same contract.

```ts
export function traceHandler(next: Database.Handler<ItemSchema>): Database.Handler<ItemSchema> {
  return async (request, context) => {
    try {
      return await next(request, context);
    } finally {
      // Record handler execution.
    }
  };
}
```

Attach middleware to the table stream:

```ts
stream: Database.UseTableStream<{
  handler: typeof streamHandler;
  middlewares: [typeof traceHandler];
}>;
```

## Database behavior

Middleware errors follow the stream handler retry behavior of the selected database provider. Middleware runs only after stream validation and transformation. Use a listener to observe earlier failures.

## What's next

- [Database streams](./database-streams.md)
- [Database handler](./database-handler.md)
- [Database listener](./database-listener.md)
- [Database client](./database-client.md)
- [Middleware overview](../../../documentation/middleware.md)

## License

MIT License
