import type { ObjectSchemaProperties } from '@ez4/schema';
import type { TableIndex } from '@ez4/database/library';

import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getUpdateQueries } from '@ez4/pgmigration';
import { getTableRepository } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

describe('migration :: update index tests', () => {
  const getDatabaseTables = (properties: ObjectSchemaProperties, indexes: TableIndex[] = []) => {
    return getTableRepository([
      {
        name: 'table',
        schema: {
          type: SchemaType.Object,
          properties
        },
        indexes
      }
    ]);
  };

  const singleColumn: ObjectSchemaProperties = {
    column: {
      type: SchemaType.String
    }
  };

  const secondaryIndex: TableIndex = {
    name: 'index',
    type: Index.Secondary,
    columns: ['column']
  };

  const uniqueIndex: TableIndex = {
    name: 'index',
    type: Index.Unique,
    columns: ['column']
  };

  it('assert :: update index type (from unique to secondary)', async () => {
    const sourceTable = getDatabaseTables(singleColumn, [uniqueIndex]);
    const targetTable = getDatabaseTables(singleColumn, [secondaryIndex]);

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries, {
      tables: [],
      constraints: [
        {
          query: `ALTER TABLE IF EXISTS "table" DROP CONSTRAINT IF EXISTS "table_index_uk"`
        }
      ],
      relations: [],
      indexes: [
        {
          query: `CREATE INDEX CONCURRENTLY IF NOT EXISTS "table_index_sk" ON "table" USING BTREE ("column")`
        }
      ]
    });
  });

  it('assert :: update index type (from secondary to unique)', async () => {
    const sourceTable = getDatabaseTables(singleColumn, [secondaryIndex]);
    const targetTable = getDatabaseTables(singleColumn, [uniqueIndex]);

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries, {
      tables: [],
      constraints: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_index_uk'`,
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_index_uk" UNIQUE ("column")`
        }
      ],
      relations: [],
      indexes: [
        {
          query: `DROP INDEX CONCURRENTLY IF EXISTS "table_index_sk"`
        }
      ]
    });
  });
});
