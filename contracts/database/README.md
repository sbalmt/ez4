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
import type { Environment, Service } from '@ez4/common';
import type { Database } from '@ez4/database';

// MyDb message
type MyTableSchema = {
  foo: string;
  bar: number;
};

// MyDb declaration
export declare class MyDb extends Database.Service {
  client: Client<Db>;

  engine: PostgresEngine;

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

#### Use database

Any handler with access to the database service can perform queries.

```ts
import type { Service } from '@ez4/common';
import type { MyDb } from './db';

// Any other handler that has injected MyDb service
export async function anyHandler(_request: any, context: Service.Context<DummyService>) {
  const { myDb } = context;

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

## Database properties

#### Service

| Name        | Type                      | Description                                           |
| ----------- | ------------------------- | ----------------------------------------------------- |
| scalability | Database.UseScalability<> | Scalability configuration.                            |
| tables      | Database.UseTable<>       | Defines all tables available in the database service. |
| engine      | Database.UseEngine<>      | Determines which database engine to use.              |
| variables   | object                    | Environment variables associated with all streams.    |
| services    | object                    | Injected services associated with all streams.        |

> Use type helpers for `scalability` and `tables` properties.

#### Tables

| Name      | Type                      | Description                 |
| --------- | ------------------------- | --------------------------- |
| stream    | Database.UseTableStream<> | Table stream configuration. |
| name      | string                    | Table name.                 |
| schema    | object                    | Table schema.               |
| relations | object                    | Table relations.            |
| indexes   | object                    | Table indexes.              |

#### Streams (DynamoDB only)

| Name         | Type             | Description                                                 |
| ------------ | ---------------- | ----------------------------------------------------------- |
| listener     | function         | Life-cycle listener function for the stream.                |
| handler      | function         | Entry-point handler function for the stream.                |
| variables    | object           | Environment variables associated with the stream.           |
| logRetention | integer          | Log retention (in days) for the handler.                    |
| logLevel     | LogLevel         | Log level for the handler.                                  |
| architecture | ArchitectureType | Architecture type for the cloud function.                   |
| runtime      | RuntimeType      | Runtime for the cloud function.                             |
| files        | string[]         | Additional resource files added into the handler bundle.    |
| memory       | integer          | Memory available (in megabytes) for the handler.            |
| timeout      | integer          | Max execution time (in seconds) for the handler.            |
| debug        | boolean          | Determine whether the debug mode is active for the handler. |
| vpc          | boolean          | Determines whether or not VPC is enabled for the handler.   |

> Streams is a DynamoDB feature, thus unavailable for Aurora Postgres.

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
