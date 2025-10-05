import type { ObjectSchemaProperties } from '@ez4/schema';

import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getUpdateQueries } from '@ez4/pgmigration';
import { getTableRepository } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';

describe('migration :: delete constraint tests', () => {
  const getDatabaseTables = (properties: ObjectSchemaProperties) => {
    return getTableRepository([
      {
        name: 'table',
        indexes: [],
        relations: [],
        schema: {
          type: SchemaType.Object,
          properties
        }
      }
    ]);
  };

  it('assert :: delete (with column)', async () => {
    const sourceTable = getDatabaseTables({
      column: {
        type: SchemaType.Enum,
        options: [
          {
            value: 'foo'
          },
          {
            value: 123
          }
        ]
      }
    });

    const targetTable = getDatabaseTables({});

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries, {
      tables: [
        {
          query: `ALTER TABLE IF EXISTS "table" DROP COLUMN IF EXISTS "column"`
        }
      ],
      constraints: [
        {
          query: `ALTER TABLE IF EXISTS "table" DROP CONSTRAINT IF EXISTS "table_column_ck"`
        }
      ],
      relations: [],
      indexes: []
    });
  });

  it('assert :: delete (with column type)', async () => {
    const sourceTable = getDatabaseTables({
      column: {
        type: SchemaType.Enum,
        options: [
          {
            value: 'foo'
          },
          {
            value: 123
          }
        ]
      }
    });

    const targetTable = getDatabaseTables({
      column: {
        type: SchemaType.String
      }
    });

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries, {
      tables: [
        {
          check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'column' AND "table_name" = 'table')`,
          query: `ALTER TABLE IF EXISTS "table" ALTER COLUMN "column" TYPE text USING "column"::text`
        }
      ],
      constraints: [
        {
          query: `ALTER TABLE IF EXISTS "table" DROP CONSTRAINT IF EXISTS "table_column_ck"`
        }
      ],
      relations: [],
      indexes: []
    });
  });
});
