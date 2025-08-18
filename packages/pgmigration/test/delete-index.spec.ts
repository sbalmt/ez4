import type { TableIndex } from '@ez4/database/library';

import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getUpdateQueries } from '@ez4/pgmigration';
import { getTablesRepository } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

describe('migration :: delete index tests', () => {
  const getDatabaseTables = (indexes: TableIndex[]) => {
    return getTablesRepository([
      {
        name: 'table',
        schema: {
          type: SchemaType.Object,
          properties: {
            column: {
              type: SchemaType.String
            }
          }
        },
        indexes
      }
    ]);
  };

  it('assert :: delete primary index', async () => {
    const sourceTable = getDatabaseTables([
      {
        name: 'index',
        type: Index.Primary,
        columns: ['column']
      }
    ]);

    const targetTable = getDatabaseTables([]);

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries.indexes, [
      {
        query: `ALTER TABLE IF EXISTS "table" DROP CONSTRAINT IF EXISTS "table_index_pk"`
      }
    ]);

    deepEqual(queries.relations, []);
    deepEqual(queries.tables, []);
  });

  it('assert :: delete unique index', async () => {
    const sourceTable = getDatabaseTables([
      {
        name: 'index',
        type: Index.Unique,
        columns: ['column']
      }
    ]);

    const targetTable = getDatabaseTables([]);

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries.indexes, [
      {
        query: `ALTER TABLE IF EXISTS "table" DROP CONSTRAINT IF EXISTS "table_index_uk"`
      }
    ]);

    deepEqual(queries.relations, []);
    deepEqual(queries.tables, []);
  });

  it('assert :: delete secondary index', async () => {
    const sourceTable = getDatabaseTables([
      {
        name: 'index',
        type: Index.Secondary,
        columns: ['column']
      }
    ]);

    const targetTable = getDatabaseTables([]);

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries.indexes, [
      {
        query: `DROP INDEX CONCURRENTLY IF EXISTS "table_index_sk"`
      }
    ]);

    deepEqual(queries.relations, []);
    deepEqual(queries.tables, []);
  });
});
