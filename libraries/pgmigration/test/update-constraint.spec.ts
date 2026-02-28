import type { ObjectSchemaProperties } from '@ez4/schema';

import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getUpdateQueries } from '@ez4/pgmigration';
import { getTableRepository } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';

describe('migration :: update constraint tests', () => {
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

  it('assert :: update (with column type)', async () => {
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
        type: SchemaType.Enum,
        options: [
          {
            value: 'foo'
          },
          {
            value: 123
          },
          {
            value: 'bar'
          },
          {
            value: 456
          }
        ]
      }
    });

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries, {
      tables: [],
      constraints: [
        {
          query: `ALTER TABLE IF EXISTS "table" DROP CONSTRAINT IF EXISTS "table_column_ck"`
        },
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_column_ck'`,
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_column_ck" CHECK ("column" IN ('foo', '123', 'bar', '456')) NOT VALID`
        }
      ],
      validations: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = true AND "conname" = 'table_column_ck'`,
          query: 'ALTER TABLE IF EXISTS "table" VALIDATE CONSTRAINT "table_column_ck"'
        }
      ],
      relations: [],
      indexes: []
    });
  });
});
