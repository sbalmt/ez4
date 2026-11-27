# EZ4: Database Middlewares

Database middleware wraps table stream handler execution after stream request validation and transformation. It follows the shared EZ4 [middleware behavior](../../../documentation/middlewares.md).

## Middleware implementation

A middleware receives the next typed `Database.Handler<T>` and the linked service context, then returns another handler with the same contract.

```ts
export function traceHandler(next: Database.Handler<ItemSchema>, { myClient }: Service.Context<MyDatabase>): Database.Handler<ItemSchema> {
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

Attach middleware to the table stream:

```ts
stream: Database.UseTableStream<{
  handler: typeof streamHandler;
  middlewares: [typeof traceHandler];
}>;
```

> Context destructuring in the middleware factory determines which linked services are retained. Keep the services used by middleware explicit even when the user handler does not use them.

## Database behavior

Middleware errors follow the stream handler retry behavior of the selected database provider. Middleware runs only after stream validation and transformation. Use a listener to observe earlier failures.

## What's next

- [Database streams](./database-streams.md)
- [Database handler](./database-handler.md)
- [Database listener](./database-listener.md)
- [Database client](./database-client.md)
- [Middlewares overview](../../../documentation/middlewares.md)

## License

MIT License
