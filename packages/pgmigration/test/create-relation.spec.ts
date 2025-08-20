import type { TableRelation } from '@ez4/database/library';

import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getUpdateQueries } from '@ez4/pgmigration';
import { getTableRepository } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

describe('migration :: create relation tests', () => {
  const getDatabaseTables = (nullish: boolean, relations: TableRelation[]) => {
    return getTableRepository([
      {
        name: 'table_a',
        indexes: [],
        relations,
        schema: {
          type: SchemaType.Object,
          properties: {
            column_a: {
              type: SchemaType.String,
              optional: nullish,
              nullable: nullish
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

  it('assert :: create relation (mandatory)', async () => {
    const sourceTable = getDatabaseTables(false, []);

    const targetTable = getDatabaseTables(false, [
      {
        sourceTable: 'table_b',
        sourceColumn: 'column_b',
        sourceIndex: Index.Primary,
        targetAlias: 'relation',
        targetColumn: 'column_a',
        targetIndex: Index.Secondary
      }
    ]);

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries.relations, [
      {
        check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_a_relation_fk'`,
        query:
          `ALTER TABLE IF EXISTS "table_a" ADD CONSTRAINT "table_a_relation_fk" ` +
          `FOREIGN KEY ("column_a") REFERENCES "table_b" ("column_b") ` +
          `ON DELETE CASCADE ` +
          `ON UPDATE CASCADE`
      }
    ]);

    deepEqual(queries.indexes, []);
    deepEqual(queries.tables, []);
  });

  it('assert :: create relation (nullable)', async () => {
    const sourceTable = getDatabaseTables(true, []);

    const targetTable = getDatabaseTables(true, [
      {
        sourceTable: 'table_b',
        sourceColumn: 'column_b',
        sourceIndex: Index.Primary,
        targetAlias: 'relation',
        targetColumn: 'column_a',
        targetIndex: Index.Unique
      }
    ]);

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries.relations, [
      {
        check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_a_relation_fk'`,
        query:
          `ALTER TABLE IF EXISTS "table_a" ADD CONSTRAINT "table_a_relation_fk" ` +
          `FOREIGN KEY ("column_a") REFERENCES "table_b" ("column_b") ` +
          `ON DELETE SET null ` +
          `ON UPDATE CASCADE`
      }
    ]);

    deepEqual(queries.indexes, []);
    deepEqual(queries.tables, []);
  });
});
