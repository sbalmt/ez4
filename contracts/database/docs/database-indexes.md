# EZ4: Database Indexes

Database indexes identify primary keys and define the lookup, ordering, uniqueness, and expiration behavior available for table records.

## Index declaration

Declare indexes inside a `Database.UseTable` definition with the exported `Index` values.

```ts
Database.UseTable<{
  name: 'items';
  schema: ItemSchema;
  indexes: {
    id: Index.Primary;
    slug: Index.Unique;
    created_at: Index.Secondary;
    expire_at: Index.TTL;
  };
}>;
```

## Index fields

Index support and restrictions depend on the selected database provider. To define a composite index, join field names with `:`.

#### `Index.Primary`

Identifies the primary key or composite primary key.

```ts
indexes: {
  id: Index.Primary;
  'id:column': Index.Primary; // Composite primary key
}
```

> A table can have only one primary key, depending on the selected database provider.

#### `Index.Unique`

Requires values to be unique and supports unique lookups.

```ts
indexes: {
  'column_a:column_b': Index.Primary; // Composite primary key
  column: Index.Unique;
}
```

#### `Index.Secondary`

Supports lookups and ordering on non-primary fields.

```ts
indexes: {
  'column_a:column_b': Index.Primary; // Composite primary key
  column: Index.Secondary;
}
```

#### `Index.TTL`

Identifies the field used for record expiration.

```ts
indexes: {
  expire_at: Index.TTL;
}
```

## What's next

- [Database service](./database-service.md)
- [Database table](./database-table.md)
- [Database relations](./database-relations.md)
- [Database engine](./database-engine.md)
- [Database streams](./database-streams.md)
- [Database handler](./database-handler.md)
- [Database listener](./database-listener.md)
- [Database client](./database-client.md)
- [Database queries](./database-queries.md)

## License

MIT License
