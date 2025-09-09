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
      name: 'table_a';
      schema: {
        id_a: String.UUID;
        relation_1_id?: String.UUID | null;
        relation_2_id?: String.UUID | null;
        value: string;
      };
      relations: {
        // Secondary to primary
        'relation_1_id@relation_1': 'table_b:id_b';

        // Secondary to unique
        'relation_2_id@relation_2': 'table_c:unique_2_id';
      };
      indexes: {
        id_a: Index.Primary;
        relation_1_id: Index.Secondary;
        relation_2_id: Index.Secondary;
      };
    },
    {
      name: 'table_b';
      schema: {
        id_b: String.UUID;
        value: string;
      };
      relations: {
        // Primary to secondary
        'id_b@relations': 'table_a:relation_1_id';

        // Primary to unique
        'id_b@relation': 'table_c:unique_1_id';
      };
      indexes: {
        id_b: Index.Primary;
      };
    },
    {
      name: 'table_c';
      schema: {
        id_c: String.UUID;
        unique_1_id?: String.UUID | null;
        unique_2_id?: String.UUID | null;
        value: string;
      };
      relations: {
        // Unique to primary
        'unique_1_id@relation': 'table_b:id_b';

        // Unique to secondary
        'unique_2_id@relations': 'table_a:relation_2_id';
      };
      indexes: {
        id_c: Index.Primary;
        unique_1_id: Index.Unique;
        unique_2_id: Index.Unique;
      };
    }
  ];
}

export const makeRelationClient = async () => {
  return Client.make<TestRelationDb>({
    debug: false,
    repository: {
      table_a: {
        name: 'table_a',
        relations: {
          relation_1: {
            sourceColumn: 'id_b',
            sourceIndex: Index.Primary,
            sourceTable: 'table_b',
            targetColumn: 'relation_1_id'
          },
          relation_2: {
            sourceColumn: 'unique_2_id',
            sourceIndex: Index.Unique,
            sourceTable: 'table_c',
            targetColumn: 'relation_2_id'
          }
        },
        schema: {
          type: SchemaType.Object,
          properties: {
            id_a: {
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
          id_a: {
            name: 'id_a',
            columns: ['id_a'],
            type: Index.Primary
          }
        }
      },
      table_b: {
        name: 'table_b',
        relations: {
          relations: {
            sourceColumn: 'relation_1_id',
            sourceTable: 'table_a',
            targetColumn: 'id_b',
            targetIndex: Index.Primary
          },
          relation: {
            sourceColumn: 'unique_1_id',
            sourceIndex: Index.Unique,
            sourceTable: 'table_c',
            targetColumn: 'id_b',
            targetIndex: Index.Primary
          }
        },
        schema: {
          type: SchemaType.Object,
          properties: {
            id_b: {
              type: SchemaType.String,
              format: 'uuid'
            },
            value: {
              type: SchemaType.String
            }
          }
        },
        indexes: {
          id_b: {
            name: 'id_b',
            columns: ['id_b'],
            type: Index.Primary
          }
        }
      },
      table_c: {
        name: 'table_c',
        relations: {
          relation: {
            sourceColumn: 'id_b',
            sourceIndex: Index.Primary,
            sourceTable: 'table_b',
            targetColumn: 'unique_1_id',
            targetIndex: Index.Unique
          },
          relations: {
            sourceColumn: 'relation_2_id',
            sourceTable: 'table_a',
            targetColumn: 'unique_2_id',
            targetIndex: Index.Unique
          }
        },
        schema: {
          type: SchemaType.Object,
          properties: {
            id_c: {
              type: SchemaType.String,
              format: 'uuid'
            },
            unique_1_id: {
              type: SchemaType.String,
              format: 'uuid',
              optional: true,
              nullable: true
            },
            unique_2_id: {
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
          id_c: {
            name: 'id_c',
            columns: ['id_c'],
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
    await transaction.rawQuery(`DROP TABLE IF EXISTS "table_a"`);
    await transaction.rawQuery(`DROP TABLE IF EXISTS "table_b"`);
    await transaction.rawQuery(`DROP TABLE IF EXISTS "table_c"`);

    await transaction.rawQuery(`CREATE TABLE IF NOT EXISTS "table_b" ("id_b" UUID PRIMARY KEY, "value" text)`);

    await transaction.rawQuery(
      `CREATE TABLE IF NOT EXISTS "table_c" (` +
        `"id_c" UUID PRIMARY KEY, ` +
        `"unique_1_id" UUID UNIQUE, ` +
        `"unique_2_id" UUID UNIQUE, ` +
        `"value" text` +
        `)`
    );

    await transaction.rawQuery(
      `CREATE TABLE IF NOT EXISTS "table_a" (` +
        `"id_a" UUID NOT null PRIMARY KEY, ` +
        `"relation_1_id" UUID, ` +
        `"relation_2_id" UUID, ` +
        `"value" text NOT null, ` +
        `FOREIGN KEY ("relation_1_id") REFERENCES table_b("id_b"), ` +
        `FOREIGN KEY ("relation_2_id") REFERENCES table_c("unique_2_id")` +
        `)`
    );
  });
};
