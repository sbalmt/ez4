import type { TableRelation } from '@ez4/database/library';

import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getUpdateQueries } from '@ez4/pgmigration';
import { getTableRepository } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

describe('migration :: create relation tests', () => {
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

  it('assert :: create relation (primary to secondary)', async () => {
    const sourceTable = getDatabaseTables([]);

    const targetTable = getDatabaseTables([
      {
        sourceTable: 'table_a',
        targetAlias: 'table_b',
        targetColumn: 'column_b',
        sourceColumn: 'column_a',
        sourceIndex: Index.Primary,
        targetIndex: Index.Secondary
      }
    ]);

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries.relations, [
      `ALTER TABLE "table_a" ` +
        //
        `ADD CONSTRAINT "table_a_table_b_fk" FOREIGN KEY "column_b" ` +
        `REFERENCES "table_a" ("column_a") ` +
        `ON DELETE CASCADE ` +
        `ON UPDATE CASCADE`
    ]);

    deepEqual(queries.indexes, []);
    deepEqual(queries.tables, []);
  });

  it('assert :: create relation (primary to unique)', async () => {
    const sourceTable = getDatabaseTables([]);

    const targetTable = getDatabaseTables([
      {
        sourceTable: 'table_a',
        targetAlias: 'table_b',
        targetColumn: 'column_b',
        sourceColumn: 'column_a',
        sourceIndex: Index.Primary,
        targetIndex: Index.Unique
      }
    ]);

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries.relations, [
      `ALTER TABLE "table_a" ` +
        //
        `ADD CONSTRAINT "table_a_table_b_fk" FOREIGN KEY "column_b" ` +
        `REFERENCES "table_a" ("column_a") ` +
        `ON DELETE CASCADE ` +
        `ON UPDATE CASCADE`
    ]);

    deepEqual(queries.indexes, []);
    deepEqual(queries.tables, []);
  });
});
