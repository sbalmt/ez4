# EZ4: Database Handler

Database handlers define the **business logic** executed when a table stream receives a matching record change. A handler receives a fully typed request object, a database service context, and returns void. Handlers run inside an isolated cloud resource and represent the core execution unit of a database stream.

## Stream handler

Use `Database.Incoming<Schema>` to receive a discriminated union of insert, update, and delete changes. The handler can access services and variables through the database service context.

```ts
import type { Environment, Service } from '@ez4/common';
import type { Database } from '@ez4/database';

import { StreamChangeType } from '@ez4/database';

export function streamHandler(request: Database.Incoming<ItemSchema>, { myClient, myVariables }: Service.Context<MyDb>): void {
  // Access only the linked context services declared here.
  myClient.doSomething();
  myVariables.myVariable;

  switch (request.type) {
    case StreamChangeType.Insert:
      // Handle inserted records from request.record.
      break;

    case StreamChangeType.Update:
      // Handle updated records from request.oldRecord and request.newRecord.
      break;

    case StreamChangeType.Delete:
      // Handle deleted records from request.record.
      break;
  }
}
```

> Parameter destructuring is recommended because EZ4 uses the named bindings to retain only the linked services needed by the handler. Passing an entire context object or spreading it keeps all linked services available.

> Database streams receive `Service.Context<MyDb>`. Declare linked `services` and `variables` on the [database service](./database-service.md) before using them in the handler, middleware, or listener.

## Handler middlewares

Database streams can wrap handlers with ordered [middleware](./database-middleware.md). Middleware runs after validation and immediately before the user handler.

> Context references are inferred from parameter destructuring. Destructuring keeps only the named services; accepting the context without destructuring or using a spread keeps all linked services available. Services used only by a [middleware](../../../documentation/middlewares.md) or lifecycle listener must be destructured there as well; otherwise, when they are absent from the handler destructuring, they can be omitted from the bundle.

## Handler listener

Database streams can attach a lifecycle [listener](./database-listener.md) to observe validation and execution events. Listeners observe execution, while middleware participates in handler execution.

#### Request fields

Handlers receive a typed request object generated from the declared table schema.

- **Record`** - Insert and delete events contain the inserted or deleted record.
- **Old Record** - Update events contain the previous record.
- **New Record** - Update events contain the updated record.
- **Request Id** - A unique identifier for the stream request.
- **Trace Id** - An optional unique identifier across multiple services.

All fields are typed from the declared schema and stream contract.

#### Error handling

- Throwing an exception from the handler fails stream processing according to the selected provider's retry semantics.
- Delivery guarantees, batching, and retry behavior depend on the selected provider.

#### Timeouts and resource limits

- Keep handler execution within the `timeout` configured on the table stream.
- Use `memory`, `architecture`, and `runtime` to configure the stream handler resource.

## What's next

- [Database service](./database-service.md)
- [Database table](./database-table.md)
- [Database indexes](./database-indexes.md)
- [Database relations](./database-relations.md)
- [Database engine](./database-engine.md)
- [Database streams](./database-streams.md)
- [Database listener](./database-listener.md)
- [Database middlewares](./database-middleware.md)
- [Database client](./database-client.md)
- [Database queries](./database-queries.md)

## License

MIT License
