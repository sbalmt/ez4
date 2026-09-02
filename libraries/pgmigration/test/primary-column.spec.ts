import type { ObjectSchemaProperties } from '@ez4/schema';
import type { TableIndex } from '@ez4/database/library';

import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getUpdateStepQueries } from '@ez4/pgmigration';
import { getTableRepository } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

describe('migration :: primary column tests', () => {
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

  it('assert :: ignore attributes (nullable and optional)', async () => {
    const indexes = [
      {
        name: 'id',
        type: Index.Primary,
        columns: ['id']
      }
    ];

    const sourceTable = getDatabaseTables(
      {
        id: {
          type: SchemaType.String
        }
      },
      indexes
    );

    const targetTable = getDatabaseTables(
      {
        id: {
          type: SchemaType.String,
          optional: true,
          nullable: true
        }
      },
      indexes
    );

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      create: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      update: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      delete: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      }
    });
  });

  it('assert :: rename column', async () => {
    const sourceTable = getDatabaseTables(
      {
        id: {
          type: SchemaType.String
        }
      },
      [
        {
          name: 'id',
          type: Index.Primary,
          columns: ['id']
        }
      ]
    );

    const targetTable = getDatabaseTables(
      {
        renamed_id: {
          type: SchemaType.String
        }
      },
      [
        {
          name: 'renamed_id',
          type: Index.Primary,
          columns: ['renamed_id']
        }
      ]
    );

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      create: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      update: {
        tables: [
          {
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'id' AND "table_name" = 'table')`,
            query: 'ALTER TABLE IF EXISTS "table" RENAME COLUMN "id" TO "renamed_id"'
          }
        ],
        constraints: [
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_renamed_id_pk'`,
            query: 'ALTER TABLE IF EXISTS "table" RENAME CONSTRAINT "table_id_pk" TO "table_renamed_id_pk"'
          }
        ],
        validations: [],
        relations: [],
        indexes: []
      },
      delete: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      }
    });
  });

  it('assert :: replace column', async () => {
    const sourceTable = getDatabaseTables(
      {
        id: {
          type: SchemaType.String
        }
      },
      [
        {
          name: 'id',
          type: Index.Primary,
          columns: ['id']
        }
      ]
    );

    const targetTable = getDatabaseTables(
      {
        replacement: {
          type: SchemaType.String
        }
      },
      [
        {
          name: 'replacement',
          type: Index.Primary,
          columns: ['replacement']
        }
      ]
    );

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      create: {
        tables: [
          {
            query: `ALTER TABLE IF EXISTS "table" ADD COLUMN IF NOT EXISTS "replacement" text NOT null`
          }
        ],
        constraints: [
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_replacement_pk'`,
            query: 'ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_replacement_pk" PRIMARY KEY ("replacement")'
          }
        ],
        validations: [],
        relations: [],
        indexes: []
      },
      update: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      delete: {
        tables: [
          {
            query: 'ALTER TABLE IF EXISTS "table" DROP COLUMN IF EXISTS "id"'
          }
        ],
        constraints: [
          {
            query: 'ALTER TABLE IF EXISTS "table" DROP CONSTRAINT IF EXISTS "table_id_pk"'
          }
        ],
        validations: [],
        relations: [],
        indexes: []
      }
    });
  });
});
