# EZ4: Database Client

The database client exposes a simple, type-safe API for accessing the tables declared by a [reflection-driven](../../../foundation/reflection/) database service. It is injected into the execution context when the database service is available.

## Client declaration

Declare a `Client<Service>` property on the database service to expose its typed client.

```ts
import type { Client, Database } from '@ez4/database';
import type { PostgresEngine } from '@ez4/aws-aurora/client';

export declare class MyDb extends Database.Service<PostgresEngine> {
  client: Client<MyDb>;

  tables: [
    Database.UseTable<{
      name: 'items';
      schema: ItemSchema;
    }>
  ];
}
```

> The client type reflects the tables, schema, indexes, relations, and capabilities declared by the database service.

## Client API

The client API provides a unified way to query and mutate database records across supported providers. Operation inputs, selected fields, filters, pagination, relations, and result shapes are inferred from the current contract and selected engine.

#### Insert one

Inserts one record and returns selected fields, or `void`.

Use `data` to provide the record and `select` to return fields from the inserted record.

```ts
const item = await myDb.items.insertOne({
  data: {
    id: 'item-1',
    category_id: 'category-1',
    name: 'Keyboard',
    price: 99
  }
});
```

#### Find one

Finds one record by a primary or unique index and returns the selected record or `undefined`.

The `select` object determines both the returned fields and the TypeScript result type.

```ts
const item = await myDb.items.findOne({
  select: {
    id: true,
    name: true
  },
  where: {
    id: 'item-1'
  }
});
```

#### Update one

Updates one record by a primary or unique index and returns selected fields, `undefined`, or `void`.

Use literal values to replace fields or atomic operations to modify their current values.

Number fields support `increment`, `decrement`, `multiply`, and `divide`. Nested object fields support `replaceWith`; nullable nested fields can also support `removeFrom`.

```ts
const item = await myDb.items.updateOne({
  select: {
    id: true,
    price: true
  },
  data: {
    price: {
      increment: 10
    }
  },
  where: {
    id: 'item-1'
  }
});
```

#### Upsert one

Inserts a record or updates the matching record, optionally returning the record and insert status.

`upsertOne` separates the values used for a new record from those used for an existing record.

```ts
const result = await myDb.items.upsertOne({
  insert: {
    id: 'item-1',
    category_id: 'category-1',
    name: 'Keyboard',
    price: 99
  },
  update: {
    price: 109
  },
  where: {
    id: 'item-1'
  }
});
```

#### Delete one

Deletes one record by a primary or unique index and returns selected fields, `undefined`, or `void`.

```ts
await myDb.items.deleteOne({
  where: {
    id: 'item-1'
  }
});
```

#### Insert many

Inserts multiple records and returns `void`.

`insertMany` accepts an array and does not return inserted records.

```ts
await myDb.items.insertMany({
  data: [
    {
      id: 'item-1',
      category_id: 'category-1',
      name: 'Keyboard',
      price: 99
    },
    {
      id: 'item-2',
      category_id: 'category-1',
      name: 'Mouse',
      price: 49
    }
  ]
});
```

#### Find many

Finds records matching optional filters and pagination, returning records, pagination data, and an optional total count.

Single-record operations require a complete primary or unique index in `where`. Multi-record operations accept optional filters. When `count: true` is present, the result includes `total`; otherwise, it contains only records and any provider pagination cursor.

```ts
const result = await myDb.items.findMany({
  select: {
    id: true,
    name: true
  },
  where: {
    category_id: 'category-1'
  },
  take: 20,
  skip: 0
});
```

#### Update many

Updates records matching optional filters and pagination, returning selected records or `void`.

```ts
const items = await myDb.items.updateMany({
  select: {
    id: true,
    price: true
  },
  data: {
    price: {
      increment: 10
    }
  },
  where: {
    category_id: 'category-1'
  }
});
```

#### Delete many

Deletes records matching optional filters and pagination, returning selected records or `void`.

```ts
const items = await myDb.items.deleteMany({
  select: {
    id: true
  },
  where: {
    category_id: 'category-1'
  }
});
```

#### Exists

Determines whether any matching record exists and returns a `boolean`.

```ts
const exists = await myDb.items.exists({
  where: {
    id: 'item-1'
  }
});
```

#### Count

Counts records matching optional filters and returns a `number`.

```ts
const total = await myDb.items.count({
  where: {
    category_id: 'category-1'
  }
});
```

## Filters

Fields can be matched directly or with an operator object. Combine expressions with `AND`, `OR`, and `NOT`.

- **`equal`** - Equal to the provided value.
- **`not`** - Not equal to the provided value.
- **`gt`** - Greater than the provided value.
- **`gte`** - Greater than or equal to the provided value.
- **`lt`** - Less than the provided value.
- **`lte`** - Less than or equal to the provided value.
- **`isIn`** - Equal to one of the provided values.
- **`isBetween`** - Between the two provided values.
- **`isMissing`** - Missing from the stored record.
- **`isNull`** - Equal to `null`.
- **`isMissingOrNull`** - Missing or equal to `null`.
- **`startsWith`** - Starts with the provided string.
- **`contains`** - Contains the provided value or object fields.
- **`insensitive`** - Makes a supported string operation insensitive.

```ts
const { records } = await myDb.items.findMany({
  select: {
    id: true,
    name: true
  },
  where: {
    AND: [
      {
        name: {
          startsWith: 'key',
          insensitive: true
        }
      },
      {
        OR: [
          {
            price: {
              isBetween: [50, 100]
            }
          },
          {
            price: {
              lt: 25
            }
          }
        ]
      }
    ]
  }
});
```

> Available operators are inferred from the field type and selected engine. For example, `insensitive` is available only when the engine supports insensitive string operations.

## Relations

Select relation aliases like regular fields. Use `where` to filter the main records. Use `include` to filter nested related records and independently order or paginate them. It is most commonly used with one-to-many relations, but can also be used with supported one-to-one relations.

```ts
const { records } = await myDb.categories.findMany({
  select: {
    id: true,
    name: true,
    items: {
      id: true,
      name: true
    }
  },
  include: {
    items: {
      where: {
        price: {
          gte: 50
        }
      },
      order: {
        price: Order.Desc
      },
      skip: 0,
      take: 10
    }
  }
});
```

Nested relations can be selected through additional `select` and `include` objects.

## Pagination, ordering, and locking

Query capabilities follow the selected engine.

#### Offset pagination

Uses `skip` and `take`.

#### Cursor pagination

Uses `cursor` and `limit`; results may contain the next `cursor`.

#### Ordering

Uses `order` with `Order.Asc` or `Order.Desc`.

#### Locking

Uses `lock: true` on supported single, find, or update operations.

Some engines allow ordering by any schema field, while others restrict ordering to indexed fields. The client type exposes only valid fields and capabilities for the selected engine.

## What's next

- [Database service](./database-service.md)
- [Database table](./database-table.md)
- [Database indexes](./database-indexes.md)
- [Database relations](./database-relations.md)
- [Database engine](./database-engine.md)
- [Database streams](./database-streams.md)
- [Database handler](./database-handler.md)
- [Database listener](./database-listener.md)
- [Database queries](./database-queries.md)

## License

MIT License
