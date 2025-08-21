import type { ObjectSchemaProperties } from '@ez4/schema';

import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getCreateQueries, getUpdateQueries } from '@ez4/pgmigration';
import { getTableRepository } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';

describe('migration :: create constraint tests', () => {
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

  it('assert :: create (with table)', async () => {
    const targetTable = getDatabaseTables({
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

    const queries = getCreateQueries(targetTable);

    deepEqual(queries, {
      tables: [
        {
          query: `CREATE TABLE IF NOT EXISTS "table" ("column" text NOT null)`
        }
      ],
      constraints: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_column_ck'`,
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_column_ck" CHECK ("column" IN ('foo', '123'))`
        }
      ],
      relations: [],
      indexes: []
    });
  });

  it('assert :: create (with column type)', async () => {
    const sourceTable = getDatabaseTables({
      column: {
        type: SchemaType.String
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
          }
        ]
      }
    });

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries, {
      tables: [
        {
          check: `SELECT 1 FROM "information_schema.columns" WHERE "column_name" = 'column' AND "table_name" = 'table'`,
          query: `ALTER TABLE IF EXISTS "table" ALTER COLUMN "column" TYPE text USING "column"::text`
        }
      ],
      constraints: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_column_ck'`,
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_column_ck" CHECK ("column" IN ('foo', '123'))`
        }
      ],
      relations: [],
      indexes: []
    });
  });

  it('assert :: create (empty enum)', async () => {
    const targetTable = getDatabaseTables({
      column: {
        type: SchemaType.Enum,
        options: []
      }
    });

    const queries = getCreateQueries(targetTable);

    deepEqual(queries, {
      tables: [
        {
          query: `CREATE TABLE IF NOT EXISTS "table" ("column" text NOT null)`
        }
      ],
      constraints: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_column_ck'`,
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_column_ck" CHECK (false)`
        }
      ],
      relations: [],
      indexes: []
    });
  });
});
