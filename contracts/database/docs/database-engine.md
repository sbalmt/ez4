# EZ4: Database Engine

A database engine is a provider capability definition used by a database service. The selected engine controls available query, transaction, relation, stream, ordering, locking, pagination, and parameter features.

## Engine declaration

A database service receives its engine as the generic parameter of `Database.Service`.

```ts
export declare class MyDb extends Database.Service<PostgresEngine> {
  engine: Database.Engine;
}
```

> Engine types are exported by database providers. See the selected provider documentation for its supported capabilities and options.

## Engine fields

#### Name

Provider-defined engine name.

```ts
name: 'postgres';
```

#### Capability modes

The engine declares the capabilities used to type and validate database operations:

- `parametersMode` - Supported raw query parameter formats.
- `transactionMode` - Interactive or static transactions.
- `insensitiveMode` - Support for insensitive string operations.
- `undefinedMode` - Whether undefined values are supported.
- `paginationMode` - Cursor or offset pagination.
- `relationMode` - Whether table relations are supported.
- `streamMode` - Whether table streams are supported.
- `orderMode` - Whether ordering supports any schema column or only indexed columns.
- `lockMode` - Whether record locking is supported.

These modes are provider-defined and should not be changed in the database service contract.

#### Options

Provider-specific options associated with the engine. The option type is defined by the selected provider.

For example, the Aurora engine exposes a connection mode:

```ts
export type ClientOptions = {
  connectionMode?: ConnectionMode;
};
```

An engine without provider options can use `options: never`.

> See the selected database provider documentation for the available engine options and their defaults.

## What's next

- [Database service](./database-service.md)
- [Database table](./database-table.md)
- [Database indexes](./database-indexes.md)
- [Database relations](./database-relations.md)
- [Database streams](./database-streams.md)
- [Database handler](./database-handler.md)
- [Database listener](./database-listener.md)
- [Database client](./database-client.md)
- [Database queries](./database-queries.md)

## License

MIT License
