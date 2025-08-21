import type { TableRelation } from '@ez4/database/library';

import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getUpdateQueries } from '@ez4/pgmigration';
import { getTableRepository } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

describe('migration :: delete relation tests', () => {
  const getDatabaseTables = (relations: TableRelation[]) => {
    return getTableRepository([
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
        sourceTable: 'table_b',
        sourceColumn: 'column_b',
        sourceIndex: Index.Primary,
        targetAlias: 'relation',
        targetColumn: 'column_a',
        targetIndex: Index.Secondary
      }
    ]);

    const targetTable = getDatabaseTables([]);

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries, {
      relations: [
        {
          query: `ALTER TABLE IF EXISTS "table_a" DROP CONSTRAINT IF EXISTS "table_a_relation_fk"`
        }
      ],
      constraints: [],
      indexes: [],
      tables: []
    });
  });
});
