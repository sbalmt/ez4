# EZ4: Database Handler

Database handlers define the **business logic** executed when a table stream receives a matching record change. A handler receives a fully typed request object, a database service context, and returns void. Handlers run inside an isolated cloud resource and represent the core execution unit of a database stream.

## Stream handler

Use `Database.Incoming<Schema>` to receive a discriminated union of insert, update, and delete changes. The handler can access services and variables through the database service context.

```ts
import type { Environment, Service } from '@ez4/common';
import type { Database } from '@ez4/database';

import { StreamChangeType } from '@ez4/database';

export function streamHandler(request: Database.Incoming<ItemSchema>, context: Service.Context<MyDb>): void {
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

> Database stream handlers use the database service as their context provider. Declare `services` and `variables` on the database service to make them available to the handler.

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
- [Database client](./database-client.md)
- [Database queries](./database-queries.md)

## License

MIT License
