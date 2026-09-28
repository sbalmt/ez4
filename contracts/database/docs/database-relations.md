# EZ4: Database Relations

Database relations connect records across tables. Relation aliases can be selected like regular fields, while `include` filters nested related records and independently orders or paginates them. It is most commonly used with one-to-many relations, but can also be used with supported one-to-one relations.

## Relation declaration

Declare relations inside a `Database.UseTable` definition. A relation key has the form `local_column@alias`, and its value has the form `target_table:target_column`.

```ts
tables: [
  Database.UseTable<{
    name: 'items';
    schema: ItemSchema;
    indexes: {
      id: Index.Primary;
      category_id: Index.Secondary;
    };
    relations: {
      'category_id@category': 'categories:id';
    };
  }>,
  Database.UseTable<{
    name: 'categories';
    schema: CategorySchema;
    indexes: {
      id: Index.Primary;
    };
    relations: {
      'id@items': 'items:category_id';
    };
  }>
];
```

## Relation fields

#### Local column and alias

The relation key combines the local column and query alias with `@`.

```ts
relations: {
  'category_id@category': 'categories:id';
}
```

#### Target table and column

The relation value combines the target table and target column with `:`.

```ts
relations: {
  'category_id@category': 'categories:id';
}
```

> Relations are available only when the selected engine supports them. TypeScript excludes the field for engines without relation support.

## What's next

- [Database service](./database-service.md)
- [Database table](./database-table.md)
- [Database indexes](./database-indexes.md)
- [Database engine](./database-engine.md)
- [Database streams](./database-streams.md)
- [Database handler](./database-handler.md)
- [Database listener](./database-listener.md)
- [Database client](./database-client.md)
- [Database queries](./database-queries.md)

## License

MIT License
