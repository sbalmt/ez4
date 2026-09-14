import type { ObjectSchemaProperties } from '@ez4/schema';

import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getUpdateStepQueries } from '@ez4/pgmigration';
import { getTableRepository } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';

describe('migration :: update constraint tests', () => {
  const getDatabaseTables = (properties: ObjectSchemaProperties) => {
    return getTableRepository([
      {
        name: 'table',
        indexes: [],
        relations: [],
        schema: {
          type: SchemaType.Object,
          properties
        }
      }
    ]);
  };

  it('assert :: update (with enum column type)', async () => {
    const sourceTable = getDatabaseTables({
      column: {
        type: SchemaType.Enum,
        options: [
          {
            value: 'foo'
          },
          {
            value: 123
          }
        ]
      }
    });

    const targetTable = getDatabaseTables({
      column: {
        type: SchemaType.Enum,
        options: [
          {
            value: 'foo'
          },
          {
            value: 123
          },
          {
            value: 'bar'
          },
          {
            value: 456
          }
        ]
      }
    });

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
        tables: [],
        constraints: [
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_column_tmp_ck'`,
            assert: `SELECT 1 FROM "table" WHERE NOT "column" IN ('foo', '123', 'bar', '456') LIMIT 1`,
            query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_column_tmp_ck" CHECK ("column" IN ('foo', '123', 'bar', '456')) NOT VALID`,
            name: 'table_column_ck'
          },
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = true AND "conname" = 'table_column_tmp_ck'`,
            query: `ALTER TABLE IF EXISTS "table" VALIDATE CONSTRAINT "table_column_tmp_ck"`
          }
        ],
        validations: [
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = false AND "conname" = 'table_column_tmp_ck'`,
            retry: `SELECT 1 FROM "pg_stat_activity" WHERE "state" = 'active' AND "query" ILIKE '%' || '"table_column_tmp_ck"' || '%' LIMIT 1`,
            name: 'table_column_ck'
          }
        ],
        relations: [],
        indexes: []
      },
      cleanup: {
        tables: [],
        constraints: [
          {
            query: `ALTER TABLE IF EXISTS "table" DROP CONSTRAINT IF EXISTS "table_column_ck"`
          },
          {
            query: 'ALTER TABLE IF EXISTS "table" RENAME CONSTRAINT "table_column_tmp_ck" TO "table_column_ck"'
          }
        ],
        validations: [],
        relations: [],
        indexes: []
      }
    });
  });

  it('assert :: update (with literal boolean column type)', async () => {
    const sourceTable = getDatabaseTables({
      column: {
        type: SchemaType.Boolean,
        definitions: {
          value: true
        }
      }
    });

    const targetTable = getDatabaseTables({
      column: {
        type: SchemaType.Boolean,
        definitions: {
          value: false
        }
      }
    });

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
        tables: [],
        constraints: [
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_column_tmp_ck'`,
            assert: 'SELECT 1 FROM "table" WHERE NOT "column" = false LIMIT 1',
            query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_column_tmp_ck" CHECK ("column" = false) NOT VALID`,
            name: 'table_column_ck'
          },
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = true AND "conname" = 'table_column_tmp_ck'`,
            query: `ALTER TABLE IF EXISTS "table" VALIDATE CONSTRAINT "table_column_tmp_ck"`
          }
        ],
        validations: [
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = false AND "conname" = 'table_column_tmp_ck'`,
            retry: `SELECT 1 FROM "pg_stat_activity" WHERE "state" = 'active' AND "query" ILIKE '%' || '"table_column_tmp_ck"' || '%' LIMIT 1`,
            name: 'table_column_ck'
          }
        ],
        relations: [],
        indexes: []
      },
      cleanup: {
        tables: [],
        constraints: [
          {
            query: `ALTER TABLE IF EXISTS "table" DROP CONSTRAINT IF EXISTS "table_column_ck"`
          },
          {
            query: 'ALTER TABLE IF EXISTS "table" RENAME CONSTRAINT "table_column_tmp_ck" TO "table_column_ck"'
          }
        ],
        validations: [],
        relations: [],
        indexes: []
      }
    });
  });

  it('assert :: update (with literal number column type)', async () => {
    const sourceTable = getDatabaseTables({
      column: {
        type: SchemaType.Number,
        definitions: {
          value: 123
        }
      }
    });

    const targetTable = getDatabaseTables({
      column: {
        type: SchemaType.Number,
        definitions: {
          value: 456
        }
      }
    });

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
        tables: [],
        constraints: [
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_column_tmp_ck'`,
            assert: 'SELECT 1 FROM "table" WHERE NOT "column" = 456 LIMIT 1',
            query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_column_tmp_ck" CHECK ("column" = 456) NOT VALID`,
            name: 'table_column_ck'
          },
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = true AND "conname" = 'table_column_tmp_ck'`,
            query: `ALTER TABLE IF EXISTS "table" VALIDATE CONSTRAINT "table_column_tmp_ck"`
          }
        ],
        validations: [
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = false AND "conname" = 'table_column_tmp_ck'`,
            retry: `SELECT 1 FROM "pg_stat_activity" WHERE "state" = 'active' AND "query" ILIKE '%' || '"table_column_tmp_ck"' || '%' LIMIT 1`,
            name: 'table_column_ck'
          }
        ],
        relations: [],
        indexes: []
      },
      cleanup: {
        tables: [],
        constraints: [
          {
            query: `ALTER TABLE IF EXISTS "table" DROP CONSTRAINT IF EXISTS "table_column_ck"`
          },
          {
            query: 'ALTER TABLE IF EXISTS "table" RENAME CONSTRAINT "table_column_tmp_ck" TO "table_column_ck"'
          }
        ],
        validations: [],
        relations: [],
        indexes: []
      }
    });
  });

  it('assert :: update (with literal string column type)', async () => {
    const sourceTable = getDatabaseTables({
      column: {
        type: SchemaType.String,
        definitions: {
          value: 'foo'
        }
      }
    });

    const targetTable = getDatabaseTables({
      column: {
        type: SchemaType.String,
        definitions: {
          value: 'bar'
        }
      }
    });

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
        tables: [],
        constraints: [
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_column_tmp_ck'`,
            assert: `SELECT 1 FROM "table" WHERE NOT "column" = 'bar' LIMIT 1`,
            query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_column_tmp_ck" CHECK ("column" = 'bar') NOT VALID`,
            name: 'table_column_ck'
          },
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = true AND "conname" = 'table_column_tmp_ck'`,
            query: `ALTER TABLE IF EXISTS "table" VALIDATE CONSTRAINT "table_column_tmp_ck"`
          }
        ],
        validations: [
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = false AND "conname" = 'table_column_tmp_ck'`,
            retry: `SELECT 1 FROM "pg_stat_activity" WHERE "state" = 'active' AND "query" ILIKE '%' || '"table_column_tmp_ck"' || '%' LIMIT 1`,
            name: 'table_column_ck'
          }
        ],
        relations: [],
        indexes: []
      },
      cleanup: {
        tables: [],
        constraints: [
          {
            query: `ALTER TABLE IF EXISTS "table" DROP CONSTRAINT IF EXISTS "table_column_ck"`
          },
          {
            query: 'ALTER TABLE IF EXISTS "table" RENAME CONSTRAINT "table_column_tmp_ck" TO "table_column_ck"'
          }
        ],
        validations: [],
        relations: [],
        indexes: []
      }
    });
  });

  it('assert :: rename constraint (with table rename)', () => {
    const sourceTable = getDatabaseTables({
      column: {
        type: SchemaType.Enum,
        options: [
          {
            value: 'foo'
          }
        ]
      }
    });

    const targetTable = {
      renamed_table: {
        ...sourceTable.table,
        name: 'renamed_table'
      }
    };

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
            query: 'ALTER TABLE IF EXISTS "table" RENAME TO "renamed_table"'
          }
        ],
        constraints: [
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'renamed_table_column_ck'`,
            query: 'ALTER TABLE IF EXISTS "renamed_table" RENAME CONSTRAINT "table_column_ck" TO "renamed_table_column_ck"'
          }
        ],
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

  it('assert :: rename constraint (with column rename)', () => {
    const sourceTable = getDatabaseTables({
      column: {
        type: SchemaType.String,
        definitions: {
          value: 'foo'
        }
      }
    });

    const targetTable = getDatabaseTables({
      renamed_column: sourceTable.table.schema.properties.column
    });

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
            query: 'ALTER TABLE IF EXISTS "table" RENAME COLUMN "column" TO "renamed_column"'
          }
        ],
        constraints: [
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_renamed_column_ck'`,
            query: 'ALTER TABLE IF EXISTS "table" RENAME CONSTRAINT "table_column_ck" TO "table_renamed_column_ck"'
          }
        ],
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
});
