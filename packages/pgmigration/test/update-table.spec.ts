import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getUpdateQueries } from '@ez4/pgmigration';
import { getTablesRepository } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

describe('migration :: update table tests', () => {
  const sourceTable = getTablesRepository([
    {
      name: 'table',
      schema: {
        type: SchemaType.Object,
        properties: {
          id: {
            type: SchemaType.String
          },
          column_a: {
            type: SchemaType.Boolean
          },
          column_b: {
            type: SchemaType.Number
          }
        }
      },
      relations: [
        {
          sourceColumn: 'id',
          sourceTable: 'table_relation',
          targetAlias: 'relation',
          targetColumn: 'column_b',
          sourceIndex: Index.Primary,
          targetIndex: Index.Unique
        }
      ],
      indexes: [
        {
          name: 'id',
          type: Index.Primary,
          columns: ['id']
        },
        {
          name: 'column_a',
          type: Index.Secondary,
          columns: ['column_a']
        },
        {
          name: 'column_b',
          type: Index.Unique,
          columns: ['column_b']
        }
      ]
    }
  ]);

  it('assert :: rename table', async () => {
    const targetTable = {
      renamed_table: {
        ...sourceTable.table,
        name: 'renamed_table'
      }
    };

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries.tables, [
      {
        query: 'ALTER TABLE IF EXISTS "table" RENAME TO "renamed_table"'
      }
    ]);

    deepEqual(queries.relations, [
      {
        check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'renamed_table_relation_fk'`,
        query: 'ALTER TABLE IF EXISTS "renamed_table" RENAME CONSTRAINT "table_relation_fk" TO "renamed_table_relation_fk"'
      }
    ]);

    deepEqual(queries.indexes, [
      {
        check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'renamed_table_id_pk'`,
        query: 'ALTER TABLE IF EXISTS "renamed_table" RENAME CONSTRAINT "table_id_pk" TO "renamed_table_id_pk"'
      },
      {
        query: 'ALTER INDEX IF EXISTS "table_column_a_sk" RENAME TO "renamed_table_column_a_sk"'
      },
      {
        check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'renamed_table_column_b_uk'`,
        query: 'ALTER TABLE IF EXISTS "renamed_table" RENAME CONSTRAINT "table_column_b_uk" TO "renamed_table_column_b_uk"'
      }
    ]);
  });
});
