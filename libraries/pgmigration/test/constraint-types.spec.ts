import type { ObjectSchemaProperties } from '@ez4/schema';

import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getTableRepository } from '@ez4/pgclient/library';
import { getCreateQueries } from '@ez4/pgmigration';
import { SchemaType } from '@ez4/schema';

describe('migration :: constraint types tests', () => {
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

  it('assert :: enum type', async () => {
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

  it('assert :: enum type (empty)', async () => {
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

  it('assert :: literal boolean', async () => {
    const targetTable = getDatabaseTables({
      column: {
        type: SchemaType.Boolean,
        definitions: {
          value: true
        }
      }
    });

    const queries = getCreateQueries(targetTable);

    deepEqual(queries, {
      tables: [
        {
          query: `CREATE TABLE IF NOT EXISTS "table" ("column" boolean NOT null)`
        }
      ],
      constraints: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_column_ck'`,
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_column_ck" CHECK ("column" = true)`
        }
      ],
      relations: [],
      indexes: []
    });
  });

  it('assert :: literal number', async () => {
    const targetTable = getDatabaseTables({
      column: {
        type: SchemaType.Number,
        definitions: {
          value: 123
        }
      }
    });

    const queries = getCreateQueries(targetTable);

    deepEqual(queries, {
      tables: [
        {
          query: `CREATE TABLE IF NOT EXISTS "table" ("column" decimal NOT null)`
        }
      ],
      constraints: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_column_ck'`,
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_column_ck" CHECK ("column" = 123)`
        }
      ],
      relations: [],
      indexes: []
    });
  });

  it('assert :: literal string', async () => {
    const targetTable = getDatabaseTables({
      column: {
        type: SchemaType.String,
        definitions: {
          value: 'foo'
        }
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
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_column_ck" CHECK ("column" = 'foo')`
        }
      ],
      relations: [],
      indexes: []
    });
  });
});
