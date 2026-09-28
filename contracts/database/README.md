# EZ4: Database

The Database contract defines a database service for your application. It uses EZ4's [reflection](../../foundation/reflection/) system to analyze your engine, tables, indexes, relations, and scalability configuration, then generates the infrastructure and runtime bindings required to store and query data.

## Getting started

#### Install

```sh
npm install @ez4/database @ez4/local-database @ez4/aws-aurora -D
```

> You can use `@ez4/aws-dynamodb` instead of `@ez4/aws-aurora` for NoSQL database.

#### Create database

Here's a minimal example of a database service with a single table.

```ts
import type { Client, Database, Index } from '@ez4/database';
import type { PostgresEngine } from '@ez4/aws-aurora/client';

// MyDb table
type MyTableSchema = {
  foo: string;
  bar: number;
};

// MyDb declaration
export declare class MyDb extends Database.Service<PostgresEngine> {
  client: Client<MyDb>;

  tables: [
    Database.UseTable<{
      name: 'test_table';
      schema: MyTableSchema;
      indexes: {
        foo: Index.Primary;
      };
    }>
  ];
}
```

> See the database [service](./docs/database-service.md) documentation.

#### Use database

Any handler with access to the database service can perform queries.

```ts
import type { Service } from '@ez4/common';
import type { MyDb } from './db';

// Any other handler that has injected MyDb service
export async function anotherHandler(_request: any, { myDb }: Service.Context<AnotherService>) {
  // Insert one record
  await myDb.test_table.insertOne({
    data: {
      foo: 'foo',
      bar: 123
    }
  });

  // Find one record
  const result = await myDb.test_table.findOne({
    select: {
      bar: true
    },
    where: {
      foo: 'foo'
    }
  });
}
```

With your database service defined, EZ4 handles provisioning, migrations, scaling, and runtime wiring automatically according to your contract.

## What's next

- [Database service](./docs/database-service.md)
- [Database table](./docs/database-table.md)
- [Database indexes](./docs/database-indexes.md)
- [Database relations](./docs/database-relations.md)
- [Database engine](./docs/database-engine.md)
- [Database streams](./docs/database-streams.md)
- [Database handler](./docs/database-handler.md)
- [Database listener](./docs/database-listener.md)
- [Database client](./docs/database-client.md)
- [Database queries](./docs/database-queries.md)

## Examples

- [Get started with Aurora RDS](../../examples/hello-aws-aurora)
- [Get started with DynamoDB](../../examples/hello-aws-dynamodb)
- [Aurora RDS CRUDL](../../examples/aws-aurora-crudl)
- [DynamoDB CRUDL](../../examples/aws-dynamodb-crudl)
- [DynamoDB streams](../../examples/aws-dynamodb-streams)
- [Schedule manager](../../examples/aws-schedule-manager)
- [Storage manager](../../examples/aws-storage-manager)

## Providers

- [Local provider](../../providers/local/local-database)
- [AWS Aurora provider](../../providers/aws/aws-aurora)
- [AWS DynamoDB provider](../../providers/aws/aws-dynamodb)

## License

MIT License
