import type { Database, Client as DbClient } from '@ez4/database';
import type { PostgresEngine } from '@ez4/pgclient/library';
import type { String } from '@ez4/schema';

import { Client } from '@ez4/pgclient';
import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

export declare class TestRelationDb extends Database.Service {
  engine: PostgresEngine;

  tables: [
    {
      name: 'ez4_test_table';
      schema: {
        id: String.UUID;
        relation_id?: String.UUID | null;
        value: string;
      };
      relations: {
        'relation_id@relation': 'ez4_test_relation:id';
      };
      indexes: {
        id: Index.Primary;
      };
    },
    {
      name: 'ez4_test_relation';
      schema: {
        id: String.UUID;
        value: string;
      };
      relations: {
        'id@relations': 'ez4_test_table:relation_id';
      };
      indexes: {
        id: Index.Primary;
      };
    }
  ];
}

export const makeRelationClient = async () => {
  return Client.make<TestRelationDb>({
    debug: false,
    repository: {
      ez4_test_table: {
        name: 'ez4_test_table',
        relations: {
          relation: {
            sourceColumn: 'id',
            sourceIndex: Index.Primary,
            sourceTable: 'ez4_test_relation',
            targetColumn: 'relation_id'
          }
        },
        schema: {
          type: SchemaType.Object,
          properties: {
            id: {
              type: SchemaType.String,
              format: 'uuid'
            },
            relation_id: {
              type: SchemaType.String,
              format: 'uuid',
              optional: true,
              nullable: true
            },
            value: {
              type: SchemaType.String
            }
          }
        },
        indexes: {
          id: {
            name: 'id',
            columns: ['id'],
            type: Index.Primary
          }
        }
      },
      ez4_test_relation: {
        name: 'ez4_test_relation',
        relations: {
          relations: {
            sourceColumn: 'relation_id',
            sourceTable: 'ez4_test_table',
            targetColumn: 'id',
            targetIndex: Index.Primary
          }
        },
        schema: {
          type: SchemaType.Object,
          properties: {
            id: {
              type: SchemaType.String,
              format: 'uuid'
            },
            value: {
              type: SchemaType.String
            }
          }
        },
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

export const prepareRelationTables = async (client: DbClient<TestRelationDb>) => {
  await client.transaction(async (transaction) => {
    await transaction.rawQuery(`DROP TABLE IF EXISTS "ez4_test_table"`);
    await transaction.rawQuery(`DROP TABLE IF EXISTS "ez4_test_relation"`);

    await transaction.rawQuery(`CREATE TABLE IF NOT EXISTS "ez4_test_relation" (id UUID PRIMARY KEY, "value" text)`);

    await transaction.rawQuery(
      `CREATE TABLE IF NOT EXISTS "ez4_test_table" (` +
        `id UUID NOT null PRIMARY KEY, ` +
        `relation_id UUID, ` +
        `"value" text NOT null, ` +
        `FOREIGN KEY (relation_id) REFERENCES ez4_test_relation(id)` +
        `)`
    );
  });
};
