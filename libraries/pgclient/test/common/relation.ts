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
        relation_1_id?: String.UUID | null;
        relation_2_id?: String.UUID | null;
        value: string;
      };
      relations: {
        'relation_1_id@relation_1': 'ez4_test_relation_1:id';
        'relation_2_id@relation_2': 'ez4_test_relation_2:unique_id';
      };
      indexes: {
        id: Index.Primary;
      };
    },
    {
      name: 'ez4_test_relation_1';
      schema: {
        id: String.UUID;
        value: string;
      };
      relations: {
        'id@relations': 'ez4_test_table:relation_1_id';
      };
      indexes: {
        id: Index.Primary;
      };
    },
    {
      name: 'ez4_test_relation_2';
      schema: {
        id: String.UUID;
        unique_id: String.UUID;
        value: string;
      };
      relations: {
        'id@relations': 'ez4_test_table:relation_2_id';
      };
      indexes: {
        id: Index.Primary;
        unique_id: Index.Primary;
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
          relation_1: {
            sourceColumn: 'id',
            sourceIndex: Index.Primary,
            sourceTable: 'ez4_test_relation_1',
            targetColumn: 'relation_1_id'
          },
          relation_2: {
            sourceColumn: 'unique_id',
            sourceIndex: Index.Unique,
            sourceTable: 'ez4_test_relation_2',
            targetColumn: 'relation_2_id'
          }
        },
        schema: {
          type: SchemaType.Object,
          properties: {
            id: {
              type: SchemaType.String,
              format: 'uuid'
            },
            relation_1_id: {
              type: SchemaType.String,
              format: 'uuid',
              optional: true,
              nullable: true
            },
            relation_2_id: {
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
      ez4_test_relation_1: {
        name: 'ez4_test_relation_1',
        relations: {
          relations: {
            sourceColumn: 'relation_1_id',
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
      },
      ez4_test_relation_2: {
        name: 'ez4_test_relation_2',
        relations: {
          relations: {
            sourceColumn: 'relation_2_id',
            sourceTable: 'ez4_test_table',
            targetColumn: 'unique_id',
            targetIndex: Index.Unique
          }
        },
        schema: {
          type: SchemaType.Object,
          properties: {
            id: {
              type: SchemaType.String,
              format: 'uuid'
            },
            unique_id: {
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
          },
          unique_id: {
            name: 'unique_id',
            columns: ['unique_id'],
            type: Index.Unique
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
    await transaction.rawQuery(`DROP TABLE IF EXISTS "ez4_test_relation_1"`);
    await transaction.rawQuery(`DROP TABLE IF EXISTS "ez4_test_relation_2"`);

    await transaction.rawQuery(`CREATE TABLE IF NOT EXISTS "ez4_test_relation_1" ("id" UUID PRIMARY KEY, "value" text)`);

    await transaction.rawQuery(
      `CREATE TABLE IF NOT EXISTS "ez4_test_relation_2" ("id" UUID PRIMARY KEY, "unique_id" UUID UNIQUE, "value" text)`
    );

    await transaction.rawQuery(
      `CREATE TABLE IF NOT EXISTS "ez4_test_table" (` +
        `"id" UUID NOT null PRIMARY KEY, ` +
        `"relation_1_id" UUID, ` +
        `"relation_2_id" UUID, ` +
        `"value" text NOT null, ` +
        `FOREIGN KEY ("relation_1_id") REFERENCES ez4_test_relation_1("id"), ` +
        `FOREIGN KEY ("relation_2_id") REFERENCES ez4_test_relation_2("unique_id")` +
        `)`
    );
  });
};
