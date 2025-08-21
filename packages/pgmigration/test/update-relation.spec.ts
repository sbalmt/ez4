import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getUpdateQueries } from '@ez4/pgmigration';
import { getTableRepository } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

describe('migration :: update relation tests', () => {
  const getDatabaseTables = (nullable: boolean) => {
    return getTableRepository([
      {
        name: 'table_a',
        indexes: [],
        relations: [
          {
            sourceTable: 'table_b',
            sourceColumn: 'column_b',
            sourceIndex: Index.Primary,
            targetAlias: 'relation',
            targetColumn: 'column_a',
            targetIndex: Index.Secondary
          }
        ],
        schema: {
          type: SchemaType.Object,
          properties: {
            column_a: {
              type: SchemaType.String,
              optional: nullable,
              nullable: nullable
            }
          }
        }
      },
      {
        name: 'table_b',
        indexes: [],
        schema: {
          type: SchemaType.Object,
          properties: {
            column_b: {
              type: SchemaType.String
            }
          }
        }
      }
    ]);
  };

  it('assert :: update relation (set mandatory)', async () => {
    const sourceTable = getDatabaseTables(true);
    const targetTable = getDatabaseTables(false);

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries, {
      tables: [
        {
          check: `SELECT 1 FROM "information_schema.columns" WHERE "column_name" = 'column_a' AND "table_name" = 'table_a'`,
          query: `ALTER TABLE IF EXISTS "table_a" ALTER COLUMN "column_a" SET NOT null`
        }
      ],
      relations: [
        {
          query: `ALTER TABLE IF EXISTS "table_a" DROP CONSTRAINT IF EXISTS "table_a_relation_fk"`
        },
        {
          query:
            `ALTER TABLE IF EXISTS "table_a" ADD CONSTRAINT "table_a_relation_fk" ` +
            `FOREIGN KEY ("column_a") REFERENCES "table_b" ("column_b") ` +
            `ON DELETE CASCADE ` +
            `ON UPDATE CASCADE`
        }
      ],
      constraints: [],
      indexes: []
    });
  });

  it('assert :: update relation (set nullable)', async () => {
    const sourceTable = getDatabaseTables(false);
    const targetTable = getDatabaseTables(true);

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries, {
      tables: [
        {
          check: `SELECT 1 FROM "information_schema.columns" WHERE "column_name" = 'column_a' AND "table_name" = 'table_a'`,
          query: `ALTER TABLE IF EXISTS "table_a" ALTER COLUMN "column_a" DROP NOT null`
        }
      ],
      relations: [
        {
          query: `ALTER TABLE IF EXISTS "table_a" DROP CONSTRAINT IF EXISTS "table_a_relation_fk"`
        },
        {
          query:
            `ALTER TABLE IF EXISTS "table_a" ADD CONSTRAINT "table_a_relation_fk" ` +
            `FOREIGN KEY ("column_a") REFERENCES "table_b" ("column_b") ` +
            `ON DELETE SET null ` +
            `ON UPDATE CASCADE`
        }
      ],
      constraints: [],
      indexes: []
    });
  });
});
