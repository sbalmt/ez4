import type { Database, Client as DbClient } from '@ez4/database';
import type { PostgresEngine } from '@ez4/pgclient/library';
import type { ObjectSchema, String } from '@ez4/schema';

import { Client } from '@ez4/pgclient';
import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

export declare class TestSchemaDb extends Database.Service {
  engine: PostgresEngine;

  tables: [
    {
      name: 'ez4_test_table';
      schema: {
        id: String.UUID;
        integer?: number;
        decimal?: number;
        boolean?: boolean;
        string?: string | null;
        datetime?: String.DateTime;
        date?: String.Date;
        time?: String.Time;
        json?: {
          string?: string;
          boolean?: boolean;
          number?: number | null;
          datetime?: String.DateTime;
          date?: String.Date;
          time?: String.Time;
          array?: (number | string)[];
        };
      };
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
        relations: {},
        schema: TestSchema,
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
        `id UUID NOT null PRIMARY KEY, ` +
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

export const TestSchema: ObjectSchema = {
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
        string: {
          type: SchemaType.String,
          optional: true,
          nullable: true
        },
        boolean: {
          type: SchemaType.Boolean,
          optional: true,
          nullable: true
        },
        number: {
          type: SchemaType.Number,
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
        array: {
          type: SchemaType.Array,
          optional: true,
          nullable: true,
          element: {
            type: SchemaType.Union,
            elements: [
              {
                type: SchemaType.Number
              },
              {
                type: SchemaType.String
              }
            ]
          }
        }
      }
    }
  }
};
