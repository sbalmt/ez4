# EZ4: Database Service

A database service defines the engine, scalability, tables, indexes, relations, and context shared by its table stream handlers. EZ4 uses a [reflection-driven](../../../foundation/reflection/) service contract to produce a typed client whose properties match the declared table names.

## Service declaration

Choose an engine exported by a database provider and pass it to `Database.Service`.

```ts
import type { Client, Database, Index } from '@ez4/database';
import type { PostgresEngine } from '@ez4/aws-aurora/client';

type ItemSchema = {
  id: string;
  category_id: string;
  name: string;
  price: number;
};

export declare class MyDb extends Database.Service<PostgresEngine> {
  client: Client<MyDb>;

  scalability: Database.UseScalability<{
    minCapacity: 0;
    maxCapacity: 2;
  }>;

  tables: [
    Database.UseTable<{
      name: 'items';
      schema: ItemSchema;
      indexes: {
        id: Index.Primary;
        category_id: Index.Secondary;
      };
    }>
  ];
}
```

## Service fields

The following fields define the database service and its runtime environment.

#### Client

Required typed client containing every table declared by the service and reflecting the current contract types.

```ts
client: Client<MyDb>;
```

#### Tables

Tables available through the database service.

```ts
tables: [
  Database.UseTable<{
    name: 'items';
    schema: ItemSchema;
    indexes: {
      id: Index.Primary;
    };
  }>
];
```

> See [database table](./database-table.md) for table fields and configuration details.

#### Scalability

Minimum and maximum capacity requested from the provider.

```ts
scalability: Database.UseScalability<{
  minCapacity: 0;
  maxCapacity: 2;
}>;
```

#### Engine

Read-only descriptor for the selected database engine.

```ts
engine: Database.Engine;
```

> See [database engine](./database-engine.md) for engine capabilities and provider-specific options.

#### Options

Read-only provider options associated with the engine.

```ts
options: object;
```

> Available options vary by the selected engine and the options exposed by its database provider. See the [database engine](./database-engine.md) documentation for details.


#### Services (optional)

Declares service bindings available to all table stream handlers using the database service as their context provider.

- Each entry represents a service that will be injected into the stream handler context.
- Handlers should only use the services they actually depend on.
- Useful for exposing shared infrastructure or internal services.
- Strongly typed and validated at compile time.

```ts
services: {
  serviceA: Environment.ServiceVariables; // For variables service
  serviceB: Environment.Service<ServiceB>; // For contract service
}
```

#### Variables (optional)

Declares environment variables that apply to all table stream handlers using the database service as their context provider.

- Supports both mapped variables and literal values.
- During metadata build, `Environment.Variable<'NAME'>` must resolve to a non-empty value.
- Use `Environment.VariableOrValue<'NAME', Default>` to fallback to `Default` when the environment variable is missing.
- Database service variables should **not** be accessed via `process.env`.
- Accessible through `Environment.ServiceVariables`.

```ts
variables: {
  variableA: Environment.Variable<'ENV_VAR_NAME'>;
  variableB: 'literal value';
}
```

The engine type determines which table and query features are available. Consult the selected provider documentation for engine options and supported capabilities.

## What's next

- [Database table](./database-table.md)
- [Database indexes](./database-indexes.md)
- [Database relations](./database-relations.md)
- [Database engine](./database-engine.md)
- [Database streams](./database-streams.md)
- [Database handler](./database-handler.md)
- [Database listener](./database-listener.md)
- [Database client](./database-client.md)
- [Database queries](./database-queries.md)

## Examples

- [Get started with Aurora RDS](../../../examples/hello-aws-aurora)
- [Get started with DynamoDB](../../../examples/hello-aws-dynamodb)
- [Aurora RDS CRUDL](../../../examples/aws-aurora-crudl)
- [DynamoDB CRUDL](../../../examples/aws-dynamodb-crudl)
- [DynamoDB streams](../../../examples/aws-dynamodb-streams)

## License

MIT License
