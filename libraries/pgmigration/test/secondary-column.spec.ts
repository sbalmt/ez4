import type { ObjectSchemaProperties } from '@ez4/schema';
import type { TableIndex } from '@ez4/database/library';

import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getUpdateStepQueries } from '@ez4/pgmigration';
import { getTableRepository } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

describe('migration :: secondary column tests', () => {
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
      },
      {
        name: 'secondary',
        type: Index.Secondary,
        columns: ['secondary']
      }
    ];

    const sourceTable = getDatabaseTables(
      {
        id: {
          type: SchemaType.String
        },
        secondary: {
          type: SchemaType.String
        }
      },
      indexes
    );

    const targetTable = getDatabaseTables(
      {
        id: {
          type: SchemaType.String
        },
        secondary: {
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
        tables: [
          {
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'secondary' AND "table_name" = 'table')`,
            query: 'ALTER TABLE IF EXISTS "table" ALTER COLUMN "secondary" DROP NOT null'
          }
        ],
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
        },
        secondary: {
          type: SchemaType.String
        }
      },
      [
        {
          name: 'id',
          type: Index.Primary,
          columns: ['id']
        },
        {
          name: 'secondary',
          type: Index.Secondary,
          columns: ['secondary']
        }
      ]
    );

    const targetTable = getDatabaseTables(
      {
        id: {
          type: SchemaType.String
        },
        renamed_secondary: {
          type: SchemaType.String
        }
      },
      [
        {
          name: 'id',
          type: Index.Primary,
          columns: ['id']
        },
        {
          name: 'renamed_secondary',
          type: Index.Secondary,
          columns: ['renamed_secondary']
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
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'secondary' AND "table_name" = 'table')`,
            query: 'ALTER TABLE IF EXISTS "table" RENAME COLUMN "secondary" TO "renamed_secondary"'
          }
        ],
        constraints: [],
        validations: [
          {
            name: 'table_renamed_secondary_sk',
            query: `SELECT 1 FROM "pg_index" WHERE "indexrelid" = 'table_renamed_secondary_sk'::regclass AND ("indisvalid" = false OR "indisready" = false)`
          }
        ],
        relations: [],
        indexes: [
          {
            query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS "table_renamed_secondary_sk" ON "table" USING BTREE ("renamed_secondary")'
          }
        ]
      },
      delete: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: [
          {
            query: 'DROP INDEX CONCURRENTLY IF EXISTS "table_secondary_sk"'
          }
        ]
      }
    });
  });

  it('assert :: replace column', async () => {
    const sourceTable = getDatabaseTables(
      {
        id: {
          type: SchemaType.String
        },
        secondary: {
          type: SchemaType.String
        }
      },
      [
        {
          name: 'id',
          type: Index.Primary,
          columns: ['id']
        },
        {
          name: 'secondary',
          type: Index.Secondary,
          columns: ['secondary']
        }
      ]
    );

    const targetTable = getDatabaseTables(
      {
        id: {
          type: SchemaType.String
        },
        replacement: {
          type: SchemaType.String
        }
      },
      [
        {
          name: 'id',
          type: Index.Primary,
          columns: ['id']
        },
        {
          name: 'replacement',
          type: Index.Secondary,
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
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      update: {
        tables: [],
        constraints: [],
        validations: [
          {
            query: `SELECT 1 FROM "pg_index" WHERE "indexrelid" = 'table_replacement_sk'::regclass AND ("indisvalid" = false OR "indisready" = false)`,
            name: 'table_replacement_sk'
          }
        ],
        relations: [],
        indexes: [
          {
            query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS "table_replacement_sk" ON "table" USING BTREE ("replacement")'
          }
        ]
      },
      delete: {
        tables: [
          {
            query: 'ALTER TABLE IF EXISTS "table" DROP COLUMN IF EXISTS "secondary"'
          }
        ],
        constraints: [],
        validations: [],
        relations: [],
        indexes: [
          {
            query: 'DROP INDEX CONCURRENTLY IF EXISTS "table_secondary_sk"'
          }
        ]
      }
    });
  });
});
