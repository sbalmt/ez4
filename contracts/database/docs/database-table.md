# EZ4: Database Table

A database table is a [reflection-driven](../../../foundation/reflection/) stored record definition that becomes a property on the database service client.

## Table declaration

Tables are declared with `Database.UseTable` inside a database service.

```ts
tables: [
  Database.UseTable<{
    name: 'items';
    schema: ItemSchema;
    indexes: {
      id: Index.Primary;
      category_id: Index.Secondary;
    };
    stream: Database.UseTableStream<{
      handler: typeof streamHandler;
    }>;
  }>
];
```

## Table fields

#### Name

Table name and corresponding property name on the typed client.

```ts
name: 'items';
```

> The declared name becomes the table name inside the database when supported by the selected database provider.

#### Schema

Shape of records stored in the table.

```ts
schema: ItemSchema;
```

> Each property in the schema becomes a table column when supported by the selected database provider.

#### Stream (optional)

Change stream configuration when supported by the selected engine.

```ts
stream: Database.UseTableStream<{
  handler: typeof streamHandler;
}>;
```

> See [database streams](./database-streams.md) for stream configuration.

## What's next

- [Database service](./database-service.md)
- [Database indexes](./database-indexes.md)
- [Database relations](./database-relations.md)
- [Database engine](./database-engine.md)
- [Database streams](./database-streams.md)
- [Database handler](./database-handler.md)
- [Database listener](./database-listener.md)
- [Database client](./database-client.md)
- [Database queries](./database-queries.md)

## License

MIT License
