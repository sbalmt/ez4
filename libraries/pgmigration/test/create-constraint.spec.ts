import type { ObjectSchemaProperties } from '@ez4/schema';

import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getTableRepository } from '@ez4/pgclient/library';
import { getCreateQueries, getUpdateQueries } from '@ez4/pgmigration';
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
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_column_ck" CHECK ("column" IN ('foo', '123')) NOT VALID`
        }
      ],
      validations: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = true AND "conname" = 'table_column_ck'`,
          query: 'ALTER TABLE IF EXISTS "table" VALIDATE CONSTRAINT "table_column_ck"',
          name: 'table_column_ck'
        }
      ],
      relations: [],
      indexes: []
    });
  });

  it('assert :: create (with enum column type)', async () => {
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
          check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'column' AND "table_name" = 'table')`,
          query: `ALTER TABLE IF EXISTS "table" ALTER COLUMN "column" TYPE text USING "column"::text`
        }
      ],
      constraints: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_column_ck'`,
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_column_ck" CHECK ("column" IN ('foo', '123')) NOT VALID`
        }
      ],
      validations: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = true AND "conname" = 'table_column_ck'`,
          query: 'ALTER TABLE IF EXISTS "table" VALIDATE CONSTRAINT "table_column_ck"',
          name: 'table_column_ck'
        }
      ],
      relations: [],
      indexes: []
    });
  });

  it('assert :: create (with literal boolean column type)', async () => {
    const sourceTable = getDatabaseTables({
      column: {
        type: SchemaType.String
      }
    });

    const targetTable = getDatabaseTables({
      column: {
        type: SchemaType.Boolean,
        definitions: {
          value: true
        }
      }
    });

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries, {
      tables: [
        {
          check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'column' AND "table_name" = 'table')`,
          query: `ALTER TABLE IF EXISTS "table" ALTER COLUMN "column" TYPE boolean USING "column"::boolean`
        }
      ],
      constraints: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_column_ck'`,
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_column_ck" CHECK ("column" = true) NOT VALID`
        }
      ],
      validations: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = true AND "conname" = 'table_column_ck'`,
          query: 'ALTER TABLE IF EXISTS "table" VALIDATE CONSTRAINT "table_column_ck"',
          name: 'table_column_ck'
        }
      ],
      relations: [],
      indexes: []
    });
  });

  it('assert :: create (with literal number column type)', async () => {
    const sourceTable = getDatabaseTables({
      column: {
        type: SchemaType.Boolean
      }
    });

    const targetTable = getDatabaseTables({
      column: {
        type: SchemaType.Number,
        definitions: {
          value: 123
        }
      }
    });

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries, {
      tables: [
        {
          check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'column' AND "table_name" = 'table')`,
          query: `ALTER TABLE IF EXISTS "table" ALTER COLUMN "column" TYPE decimal USING "column"::decimal`
        }
      ],
      constraints: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_column_ck'`,
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_column_ck" CHECK ("column" = 123) NOT VALID`
        }
      ],
      validations: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = true AND "conname" = 'table_column_ck'`,
          query: 'ALTER TABLE IF EXISTS "table" VALIDATE CONSTRAINT "table_column_ck"',
          name: 'table_column_ck'
        }
      ],
      relations: [],
      indexes: []
    });
  });

  it('assert :: create (with literal string column type)', async () => {
    const sourceTable = getDatabaseTables({
      column: {
        type: SchemaType.Number
      }
    });

    const targetTable = getDatabaseTables({
      column: {
        type: SchemaType.String,
        definitions: {
          value: 'foo'
        }
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
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_column_ck'`,
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_column_ck" CHECK ("column" = 'foo') NOT VALID`
        }
      ],
      validations: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = true AND "conname" = 'table_column_ck'`,
          query: 'ALTER TABLE IF EXISTS "table" VALIDATE CONSTRAINT "table_column_ck"',
          name: 'table_column_ck'
        }
      ],
      relations: [],
      indexes: []
    });
  });
});
