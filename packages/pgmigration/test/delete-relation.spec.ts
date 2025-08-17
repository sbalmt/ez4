import type { TableRelation } from '@ez4/database/library';

import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getUpdateQueries } from '@ez4/pgmigration';
import { getTablesRepository } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

describe('migration :: delete relation tests', () => {
  const getDatabaseTables = (relations: TableRelation[]) => {
    return getTablesRepository([
      {
        name: 'table_a',
        indexes: [],
        relations,
        schema: {
          type: SchemaType.Object,
          properties: {
            column_a: {
              type: SchemaType.String
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

  it('assert :: delete relation', async () => {
    const sourceTable = getDatabaseTables([
      {
        sourceTable: 'table_a',
        targetAlias: 'table_b',
        targetColumn: 'column_b',
        sourceColumn: 'column_a',
        sourceIndex: Index.Primary,
        targetIndex: Index.Secondary
      }
    ]);

    const targetTable = getDatabaseTables([]);

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries.relations, [
      `ALTER TABLE "table_a" ` +
        //
        `DROP CONSTRAINT IF EXISTS "table_a_table_b_fk"`
    ]);

    deepEqual(queries.indexes, []);
    deepEqual(queries.tables, []);
  });
});
