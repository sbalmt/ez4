import type { ObjectSchemaProperties } from '@ez4/schema';

import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getUpdateQueries } from '@ez4/pgmigration';
import { getTablesRepository } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

describe('migration :: delete column tests', () => {
  const getDatabaseTables = (properties: ObjectSchemaProperties) => {
    return getTablesRepository([
      {
        name: 'table',
        schema: {
          type: SchemaType.Object,
          properties
        },
        indexes: [
          {
            name: 'id',
            type: Index.Primary,
            columns: ['id']
          }
        ]
      }
    ]);
  };

  const sourceTable = getDatabaseTables({
    id: {
      type: SchemaType.String
    },
    column_a: {
      type: SchemaType.Boolean
    },
    column_b: {
      type: SchemaType.Number
    },
    column_c: {
      type: SchemaType.String
    }
  });

  it('assert :: alter table (drop column)', async () => {
    const targetTable = getDatabaseTables({
      id: {
        type: SchemaType.String
      }
    });

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries.tables, [
      `ALTER TABLE IF EXISTS "table" ` +
        //
        `DROP COLUMN IF EXISTS "column_a", ` +
        `DROP COLUMN IF EXISTS "column_b", ` +
        `DROP COLUMN IF EXISTS "column_c"`
    ]);

    deepEqual(queries.relations, []);
    deepEqual(queries.indexes, []);
  });
});
