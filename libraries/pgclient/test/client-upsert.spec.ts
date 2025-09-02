import type { Database, Client as DbClient } from '@ez4/database';
import type { PostgresEngine } from '@ez4/pgclient/library';

import { before, after, describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

import { Index } from '@ez4/database';
import { SchemaType } from '@ez4/schema';
import { Client } from '@ez4/pgclient';

declare class Test extends Database.Service {
  engine: PostgresEngine;

  tables: [
    {
      name: 'ez4_test_upsert';
      indexes: {
        id: Index.Primary;
      };
      schema: {
        id: string;
        foo: string;
      };
    }
  ];
}

describe('client upsert', async () => {
  const client: DbClient<Test> = await Client.make({
    debug: false,
    repository: {
      ez4_test_upsert: {
        name: 'ez4_test_upsert',
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
            foo: {
              type: SchemaType.String
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
    await client.rawQuery(`CREATE TABLE IF NOT EXISTS "ez4_test_upsert" (id UUID PRIMARY KEY, "foo" text)`);
  });

  after(async () => {
    await client.rawQuery(`DROP TABLE "ez4_test_upsert"`);
  });

  it('assert :: upsert sequence', async () => {
    const id = randomUUID();

    const query = {
      select: {
        foo: true
      },
      where: {
        id
      },
      insert: {
        id,
        foo: 'initial'
      },
      update: {
        foo: 'updated'
      }
    };

    // Return the current value
    const insertResult = await client.ez4_test_upsert.upsertOne(query);

    deepEqual(insertResult, {
      foo: 'initial'
    });

    // Return the last value
    const update1Result = await client.ez4_test_upsert.upsertOne(query);

    deepEqual(update1Result, {
      foo: 'initial'
    });

    // Return the last value
    const update2Result = await client.ez4_test_upsert.upsertOne(query);

    deepEqual(update2Result, {
      foo: 'updated'
    });
  });
});
