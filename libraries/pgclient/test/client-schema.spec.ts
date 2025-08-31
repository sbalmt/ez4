import type { Database, Client as DbClient } from '@ez4/database';
import type { PostgresEngine } from '@ez4/pgclient/library';
import type { String } from '@ez4/schema';

import { before, after, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'crypto';

import { Index } from '@ez4/database';
import { SchemaType } from '@ez4/schema';
import { Client } from '@ez4/pgclient';

declare class Test extends Database.Service {
  engine: PostgresEngine;

  tables: [
    {
      name: 'ez4_test_table';
      indexes: {
        id: Index.Primary;
      };
      schema: {
        id: string;
        integer?: number;
        decimal?: number;
        boolean?: boolean;
        string?: string;
        datetime?: String.DateTime;
        date?: String.Date;
        time?: String.Time;
        json?: {
          foo: string;
          bar: boolean;
          baz?: number | null;
        };
      };
    }
  ];
}

describe('client schema', async () => {
  const client: DbClient<Test> = await Client.make({
    debug: false,
    repository: {
      ez4_test_table: {
        name: 'ez4_test_table',
        relations: {},
        indexes: {
          id: {
            name: 'id',
            columns: ['id'],
            type: Index.Primary
          }
        },
        schema: {
          type: SchemaType.Object,
          properties: {
            id: {
              type: SchemaType.String,
              format: 'uuid'
            },
            integer: {
              type: SchemaType.Number,
              format: 'integer',
              optional: true,
              nullable: true
            },
            decimal: {
              type: SchemaType.Number,
              format: 'decimal',
              optional: true,
              nullable: true
            },
            boolean: {
              type: SchemaType.Boolean,
              optional: true,
              nullable: true
            },
            string: {
              type: SchemaType.String,
              optional: true,
              nullable: true
            },
            datetime: {
              type: SchemaType.String,
              format: 'date-time',
              optional: true,
              nullable: true
            },
            date: {
              type: SchemaType.String,
              format: 'date',
              optional: true,
              nullable: true
            },
            time: {
              type: SchemaType.String,
              format: 'time',
              optional: true,
              nullable: true
            },
            json: {
              type: SchemaType.Object,
              optional: true,
              nullable: true,
              properties: {
                foo: {
                  type: SchemaType.String
                },
                bar: {
                  type: SchemaType.Boolean
                },
                baz: {
                  type: SchemaType.Number,
                  optional: true,
                  nullable: true
                }
              }
            }
          }
        }
      }
    },
    connection: {
      database: 'postgres',
      password: 'postgres',
      user: 'postgres',
      host: '127.0.0.1'
    }
  });

  before(async () => {
    await client.rawQuery(
      `CREATE TABLE IF NOT EXISTS "ez4_test_table" (` +
        `id UUID PRIMARY KEY, ` +
        `"integer" bigint, ` +
        `"decimal" decimal, ` +
        `"boolean" boolean, ` +
        `"string" text,` +
        `"datetime" timestamptz,` +
        `"date" date,` +
        `"time" time,` +
        `"json" jsonb` +
        `)`
    );
  });

  after(async () => {
    await client.rawQuery(`DROP TABLE "ez4_test_table"`);
  });

  it('assert :: insert and select boolean', async () => {
    const id = randomUUID();

    await client.ez4_test_table.insertOne({
      data: {
        boolean: false,
        id
      }
    });

    const result = await client.ez4_test_table.findOne({
      select: {
        boolean: true
      },
      where: {
        id
      }
    });

    deepEqual(result, {
      boolean: false
    });
  });

  it('assert :: insert and select integer', async () => {
    const id = randomUUID();

    await client.ez4_test_table.insertOne({
      data: {
        integer: 122333,
        id
      }
    });

    const result = await client.ez4_test_table.findOne({
      select: {
        integer: true
      },
      where: {
        id
      }
    });

    deepEqual(result, {
      integer: 122333
    });
  });

  it('assert :: insert and select decimal', async () => {
    const id = randomUUID();

    await client.ez4_test_table.insertOne({
      data: {
        decimal: 10.5678,
        id
      }
    });

    const result = await client.ez4_test_table.findOne({
      select: {
        decimal: true
      },
      where: {
        id
      }
    });

    deepEqual(result, {
      decimal: 10.5678
    });
  });

  it('assert :: insert and select string', async () => {
    const id = randomUUID();

    await client.ez4_test_table.insertOne({
      data: {
        string: 'abc',
        id
      }
    });

    const result = await client.ez4_test_table.findOne({
      select: {
        string: true
      },
      where: {
        id
      }
    });

    deepEqual(result, {
      string: 'abc'
    });
  });

  it('assert :: insert and select date-time', async () => {
    const id = randomUUID();
    const datetime = '1991-04-23T00:00:00.000Z';

    await client.ez4_test_table.insertOne({
      data: {
        datetime,
        id
      }
    });

    const result = await client.ez4_test_table.findOne({
      select: {
        datetime: true
      },
      where: {
        id
      }
    });

    deepEqual(result, {
      datetime
    });
  });

  it('assert :: insert and select date', async () => {
    const id = randomUUID();
    const date = '1991-04-23';

    await client.ez4_test_table.insertOne({
      data: {
        date,
        id
      }
    });

    const result = await client.ez4_test_table.findOne({
      select: {
        date: true
      },
      where: {
        id
      }
    });

    deepEqual(result, {
      date
    });
  });

  it('assert :: insert and select time', async () => {
    const id = randomUUID();
    const time = '23:59:30.000Z';

    await client.ez4_test_table.insertOne({
      data: {
        time,
        id
      }
    });

    const result = await client.ez4_test_table.findOne({
      select: {
        time: true
      },
      where: {
        id
      }
    });

    deepEqual(result, {
      time
    });
  });

  it('assert :: insert and select json', async () => {
    const id = randomUUID();
    const json = {
      foo: 'abc',
      bar: true,
      baz: null
    };

    await client.ez4_test_table.insertOne({
      data: {
        json,
        id
      }
    });

    const result = await client.ez4_test_table.findOne({
      select: {
        json: true
      },
      where: {
        id
      }
    });

    deepEqual(result, {
      json
    });
  });
});
