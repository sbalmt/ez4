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
      prepare: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      rollout: {
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
      cleanup: {
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
      prepare: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      rollout: {
        tables: [
          {
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'secondary' AND "table_name" = 'table')`,
            query: 'ALTER TABLE IF EXISTS "table" RENAME COLUMN "secondary" TO "renamed_secondary"'
          }
        ],
        constraints: [],
        validations: [],
        relations: [],
        indexes: [
          {
            query: 'ALTER INDEX IF EXISTS "table_secondary_sk" RENAME TO "table_renamed_secondary_sk"'
          }
        ]
      },
      cleanup: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      }
    });
  });

  it('assert :: rename column (unrelated name)', async () => {
    const sourceTable = getDatabaseTables(
      {
        id: {
          type: SchemaType.String
        },
        column: {
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
          name: 'column',
          type: Index.Secondary,
          columns: ['column']
        }
      ]
    );

    const targetTable = getDatabaseTables(
      {
        id: {
          type: SchemaType.String
        },
        completely_different_name: {
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
          name: 'completely_different_name',
          type: Index.Secondary,
          columns: ['completely_different_name']
        }
      ]
    );

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      prepare: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      rollout: {
        tables: [
          {
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'column' AND "table_name" = 'table')`,
            query: 'ALTER TABLE IF EXISTS "table" RENAME COLUMN "column" TO "completely_different_name"'
          }
        ],
        constraints: [],
        validations: [
          {
            check: `SELECT 1 FROM "pg_index" WHERE "indexrelid" = 'table_completely_different_name_sk'::regclass AND ("indisvalid" = false OR "indisready" = false)`,
            retry: `SELECT 1 FROM "pg_stat_activity" WHERE "state" = 'active' AND ("query" LIKE 'ALTER TABLE' || '%' AND "query" LIKE '%' || '"table_completely_different_name_sk"' || '%') LIMIT 1`,
            name: 'table_completely_different_name_sk'
          }
        ],
        indexes: [
          {
            query:
              'CREATE INDEX CONCURRENTLY IF NOT EXISTS "table_completely_different_name_sk" ON "table" USING BTREE ("completely_different_name")'
          }
        ],
        relations: []
      },
      cleanup: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: [
          {
            query: 'DROP INDEX CONCURRENTLY IF EXISTS "table_column_sk"'
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
          type: SchemaType.Number
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
      prepare: {
        tables: [
          {
            query: `ALTER TABLE IF EXISTS "table" ADD COLUMN IF NOT EXISTS "replacement" decimal NOT null`
          }
        ],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      rollout: {
        tables: [],
        constraints: [],
        validations: [
          {
            check: `SELECT 1 FROM "pg_index" WHERE "indexrelid" = 'table_replacement_sk'::regclass AND ("indisvalid" = false OR "indisready" = false)`,
            retry: `SELECT 1 FROM "pg_stat_activity" WHERE "state" = 'active' AND ("query" LIKE 'ALTER TABLE' || '%' AND "query" LIKE '%' || '"table_replacement_sk"' || '%') LIMIT 1`,
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
      cleanup: {
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
