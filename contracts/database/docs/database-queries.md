# EZ4: Database Queries

The database client supports typed table operations, provider-native raw queries, and atomic groups of table operations. Raw query parameters and transaction inputs are inferred from the selected engine.

## Raw queries

Use `rawQuery` when an operation is not represented by the typed table client.

```ts
const records = await myDb.rawQuery('SELECT * FROM items WHERE id = :id', {
  id: 'item-1'
});
```

Depending on the engine, parameters can be positional values, named values, or both.

```ts
const records = await myDb.rawQuery('SELECT * FROM items WHERE id = :0', ['item-1']);
```

`rawQuery` returns `Record<string, unknown>[]`. Validate or narrow the result before using application-specific fields.

> Query language, placeholder syntax, and parameter support belong to the selected database provider.

## Transactions

The selected engine determines whether transactions use an interactive callback, a static operation object, or support both forms.

#### Interactive transactions

An interactive transaction receives a transaction-scoped typed client. All operations performed through that client belong to the same transaction, and the callback result becomes the transaction result.

```ts
const remainingItems = await myDb.transaction(async (client) => {
  await client.items.updateOne({
    data: {
      price: 109
    },
    where: {
      id: 'item-1'
    }
  });

  return client.items.count({
    where: {
      category_id: 'category-1'
    }
  });
});
```

> Use only the client passed to the callback for operations that must be part of the transaction.

If an operation throws or the callback rejects, the transaction fails and the selected database provider automatically rolls back all operations performed in that transaction. No partial changes are committed.

#### Static transactions

A static transaction groups insert, update, and delete operations by table name.

```ts
await myDb.transaction({
  items: [
    {
      update: {
        data: {
          price: 109
        },
        where: {
          id: 'item-1'
        }
      }
    }
  ],
  audit_entries: [
    {
      insert: {
        data: {
          id: 'audit-1',
          action: 'item-price-updated'
        }
      }
    }
  ]
});
```

Static transactions do not accept `select` or `include` and resolve without a result. Their table names and operation inputs remain fully typed from the service declaration.

> Transaction forms and limits depend on the selected engine. TypeScript accepts only the forms supported by that engine.

If any operation in the group fails, the transaction fails and the selected database provider automatically rolls back the transaction. No partial changes are committed.

## What's next

- [Database service](./database-service.md)
- [Database table](./database-table.md)
- [Database indexes](./database-indexes.md)
- [Database relations](./database-relations.md)
- [Database engine](./database-engine.md)
- [Database streams](./database-streams.md)
- [Database handler](./database-handler.md)
- [Database listener](./database-listener.md)
- [Database client](./database-client.md)

## License

MIT License
