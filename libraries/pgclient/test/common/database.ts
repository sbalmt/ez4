import type { Database, Client as DbClient } from '@ez4/database';
import type { PostgresEngine } from '@ez4/pgclient/library';
import type { String } from '@ez4/schema';

import { Index } from '@ez4/database';
import { SchemaType } from '@ez4/schema';
import { Client } from '@ez4/pgclient';

export declare class TestDb extends Database.Service {
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
        string?: string | null;
        datetime?: String.DateTime;
        date?: String.Date;
        time?: String.Time;
        json?: {
          foo: string;
          bar: boolean;
          baz?: number | null;
          qux?: String.DateTime;
        };
      };
    }
  ];
}

export const makeClient = async () => {
  return Client.make<TestDb>({
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
                },
                qux: {
                  type: SchemaType.String,
                  format: 'date-time',
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
};

export const prepareTable = async (client: DbClient<TestDb>) => {
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
