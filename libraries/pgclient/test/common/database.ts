import type { Database, Client as DbClient } from '@ez4/database';
import type { PostgresEngine } from '@ez4/pgclient/library';
import type { TestSchemaType } from './schema';

import { Client } from '@ez4/pgclient';
import { Index } from '@ez4/database';

import { TestSchema } from './schema';

export declare class TestSchemaDb extends Database.Service {
  engine: PostgresEngine;

  tables: [
    {
      name: 'ez4_test_table';
      schema: TestSchemaType;
      indexes: {
        id: Index.Primary;
      };
    }
  ];
}

export const makeSchemaClient = async () => {
  return Client.make<TestSchemaDb>({
    debug: false,
    repository: {
      ez4_test_table: {
        name: 'ez4_test_table',
        schema: TestSchema,
        relations: {},
        indexes: {
          id: {
            name: 'id',
            columns: ['id'],
            type: Index.Primary
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
};

export const prepareSchemaTable = async (client: DbClient<TestSchemaDb>) => {
  await client.transaction(async (transaction) => {
    await transaction.rawQuery(`DROP TABLE IF EXISTS "ez4_test_table"`);

    await transaction.rawQuery(
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
};
