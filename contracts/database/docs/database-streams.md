# EZ4: Database Streams

A database table stream invokes a handler when stored records change. Streams are available only for engines that expose stream support.

## Stream declaration

Add `stream` to a table and reference the handler and optional listener with `typeof`.

```ts
import type { Client, Database, Index } from '@ez4/database';
import type { DynamoDbEngine } from '@ez4/aws-dynamodb/client';

import { StreamChangeType } from '@ez4/database';

export declare class MyDb extends Database.Service<DynamoDbEngine> {
  client: Client<MyDb>;

  tables: [
    Database.UseTable<{
      name: 'items';
      schema: ItemSchema;
      indexes: {
        id: Index.Primary;
      };
      stream: Database.UseTableStream<{
        triggers: [StreamChangeType.Insert, StreamChangeType.Update];
        handler: typeof streamHandler;
        listener: typeof streamListener;
      }>;
    }>
  ];
}
```

> Omit `triggers` to receive all supported change types.

## Stream fields

The following fields define stream delivery, handler context, and runtime configuration.

#### Handler

Function invoked for each matching table change.

> See [database handler](./database-handler.md) for handler behavior and request fields.

```ts
handler: typeof streamHandler;
```

#### Triggers (optional)

Insert, update, and delete changes that invoke the handler. Omit this field to receive all supported change types.

```ts
triggers: [StreamChangeType.Insert, StreamChangeType.Update];
```

#### Listener (optional)

Function that observes the stream handler lifecycle.

> See [database listener](./database-listener.md) for listener events and failure behavior.

```ts
listener: typeof streamListener;
```

#### Variables (optional)

Variables added to the stream handler context.

```ts
variables: {
  environment: Environment.Variable<'APP_ENV'>;
}
```

#### Log retention (optional)

Log retention in days.

```ts
logRetention: 90;
```

#### Log level (optional)

Log level for the stream handler.

```ts
logLevel: LogLevel.Debug;
```

#### Architecture (optional)

Architecture used by the stream function.

```ts
architecture: ArchitectureType.Arm;
```

#### Runtime (optional)

Runtime used by the stream function.

```ts
runtime: RuntimeType.Node24;
```

#### Timeout (optional)

Maximum handler execution time in seconds.

```ts
timeout: 29;
```

#### Memory (optional)

Memory available to the handler in megabytes.

```ts
memory: 128;
```

#### Files (optional)

Additional resource files included in the handler bundle.

```ts
files: ['settings.json'];
```

#### Debug (optional)

Enables debug mode for the handler.

```ts
debug: true;
```

#### VPC (optional)

Enables VPC access for the handler.

```ts
vpc: true;
```

## What's next

- [Database service](./database-service.md)
- [Database table](./database-table.md)
- [Database indexes](./database-indexes.md)
- [Database relations](./database-relations.md)
- [Database engine](./database-engine.md)
- [Database handler](./database-handler.md)
- [Database listener](./database-listener.md)
- [Database client](./database-client.md)
- [Database queries](./database-queries.md)

## License

MIT License
