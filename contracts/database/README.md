# EZ4: Database

It uses the power of [reflection](../../foundation/reflection/) to provide a contract that determines how to build and connect database components.

## Getting started

#### Install

```sh
npm install @ez4/database @ez4/local-database @ez4/aws-aurora -D
```

> You can use `@ez4/aws-dynamodb` instead of `@ez4/aws-aurora` for NoSQL database.

#### Create database

```ts
// file: db.ts
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

```ts
// file: handler.ts
import type { Service } from '@ez4/common';
import type { myDb } from './db';

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

## Database properties

#### Service

| Name        | Type                      | Description                                      |
| ----------- | ------------------------- | ------------------------------------------------ |
| scalability | Database.UseScalability<> | Scalability configuration.                       |
| tables      | Database.UseTable<>       | Describe all available tables for the service.   |
| engine      | object                    | Determines which database engine to use.         |
| variables   | object                    | Environment variables associated to all streams. |
| services    | object                    | Injected services associated to all streams.     |

> Use type helpers for `scalability` and `tables` properties.

#### Tables

| Name      | Type                      | Description                 |
| --------- | ------------------------- | --------------------------- |
| stream    | Database.UseTableStream<> | Table stream configuration. |
| name      | string                    | Table name.                 |
| schema    | object                    | Table schema.               |
| relations | object                    | Table relations.            |
| indexes   | object                    | Table indexes.              |

#### Streams (DynamoDB)

| Name         | Type     | Description                                      |
| ------------ | -------- | ------------------------------------------------ |
| listener     | function | Life-cycle listener function for the stream.     |
| handler      | function | Entry-point handler function for the stream.     |
| variables    | object   | Environment variables associated to the stream.  |
| logRetention | integer  | Log retention (in days) for the handler.         |
| memory       | integer  | Memory available (in megabytes) for the handler. |
| timeout      | integer  | Max execution time (in seconds) for the route.   |

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
