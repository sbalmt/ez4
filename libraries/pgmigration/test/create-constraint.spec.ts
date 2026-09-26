import type { ObjectSchemaProperties } from '@ez4/schema';

import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getTableRepository } from '@ez4/pgclient/library';
import { getCreateQueries, getUpdateStepQueries } from '@ez4/pgmigration';
import { SchemaType } from '@ez4/schema';

describe('migration :: create constraint tests', () => {
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

  it('assert :: create (with table)', async () => {
    const targetTable = getDatabaseTables({
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

    const queries = getCreateQueries(targetTable);

    deepEqual(queries, {
      tables: [
        {
          query: `CREATE TABLE IF NOT EXISTS "table" ("column" text NOT null)`
        }
      ],
      constraints: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_column_ck'`,
          assert: `SELECT 1 FROM "table" WHERE NOT "column" IN ('foo', '123') LIMIT 1`,
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_column_ck" CHECK ("column" IN ('foo', '123')) NOT VALID`,
          name: 'table_column_ck'
        },
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = true AND "conname" = 'table_column_ck'`,
          query: `ALTER TABLE IF EXISTS "table" VALIDATE CONSTRAINT "table_column_ck"`
        }
      ],
      validations: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = false AND "conname" = 'table_column_ck'`,
          retry: `SELECT 1 FROM "pg_stat_activity" WHERE "state" = 'active' AND ("query" LIKE 'ALTER TABLE' || '%' AND "query" LIKE '%' || '"table_column_ck"' || '%') LIMIT 1`,
          name: 'table_column_ck'
        }
      ],
      relations: [],
      indexes: []
    });
  });

  it('assert :: create (with table rename)', () => {
    const sourceTable = getDatabaseTables({
      column: {
        type: SchemaType.String
      }
    });

    const newTable = getDatabaseTables({
      column: {
        type: SchemaType.String
      },
      status: {
        type: SchemaType.Enum,
        optional: true,
        options: [
          {
            value: 'foo'
          }
        ]
      }
    });

    const targetTable = {
      renamed_table: {
        ...newTable.table,
        name: 'renamed_table'
      }
    };

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      prepare: {
        tables: [
          {
            query: 'ALTER TABLE IF EXISTS "table" ADD COLUMN IF NOT EXISTS "status" text DEFAULT null'
          }
        ],
        constraints: [
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_status_ck'`,
            assert: `SELECT 1 FROM "table" WHERE NOT "status" IN ('foo') LIMIT 1`,
            query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_status_ck" CHECK ("status" IN ('foo')) NOT VALID`,
            name: 'table_status_ck'
          },
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = true AND "conname" = 'table_status_ck'`,
            query: 'ALTER TABLE IF EXISTS "table" VALIDATE CONSTRAINT "table_status_ck"'
          }
        ],
        validations: [
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = false AND "conname" = 'table_status_ck'`,
            retry: `SELECT 1 FROM "pg_stat_activity" WHERE "state" = 'active' AND ("query" LIKE 'ALTER TABLE' || '%' AND "query" LIKE '%' || '"table_status_ck"' || '%') LIMIT 1`,
            name: 'table_status_ck'
          }
        ],
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
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'renamed_table_status_ck'`,
            query: 'ALTER TABLE IF EXISTS "renamed_table" RENAME CONSTRAINT "table_status_ck" TO "renamed_table_status_ck"'
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

  it('assert :: create (with enum column type)', async () => {
    const sourceTable = getDatabaseTables({
      column: {
        type: SchemaType.String
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
        tables: [
          {
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'column' AND "table_name" = 'table')`,
            query: `ALTER TABLE IF EXISTS "table" ALTER COLUMN "column" TYPE text USING "column"::text`
          }
        ],
        constraints: [
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_column_tmp_ck'`,
            assert: `SELECT 1 FROM "table" WHERE NOT "column" IN ('foo', '123') LIMIT 1`,
            query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_column_tmp_ck" CHECK ("column" IN ('foo', '123')) NOT VALID`,
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
            retry: `SELECT 1 FROM "pg_stat_activity" WHERE "state" = 'active' AND ("query" LIKE 'ALTER TABLE' || '%' AND "query" LIKE '%' || '"table_column_tmp_ck"' || '%') LIMIT 1`,
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
            query: 'ALTER TABLE IF EXISTS "table" RENAME CONSTRAINT "table_column_tmp_ck" TO "table_column_ck"'
          }
        ],
        validations: [],
        relations: [],
        indexes: []
      }
    });
  });

  it('assert :: create (with literal boolean column type)', async () => {
    const sourceTable = getDatabaseTables({
      column: {
        type: SchemaType.String
      }
    });

    const targetTable = getDatabaseTables({
      column: {
        type: SchemaType.Boolean,
        definitions: {
          value: true
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
        tables: [
          {
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'column' AND "table_name" = 'table')`,
            query: `ALTER TABLE IF EXISTS "table" ALTER COLUMN "column" TYPE boolean USING "column"::boolean`
          }
        ],
        constraints: [
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_column_tmp_ck'`,
            assert: 'SELECT 1 FROM "table" WHERE NOT "column" = true LIMIT 1',
            query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_column_tmp_ck" CHECK ("column" = true) NOT VALID`,
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
            retry: `SELECT 1 FROM "pg_stat_activity" WHERE "state" = 'active' AND ("query" LIKE 'ALTER TABLE' || '%' AND "query" LIKE '%' || '"table_column_tmp_ck"' || '%') LIMIT 1`,
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
            query: 'ALTER TABLE IF EXISTS "table" RENAME CONSTRAINT "table_column_tmp_ck" TO "table_column_ck"'
          }
        ],
        validations: [],
        relations: [],
        indexes: []
      }
    });
  });

  it('assert :: create (with literal number column type)', async () => {
    const sourceTable = getDatabaseTables({
      column: {
        type: SchemaType.Boolean
      }
    });

    const targetTable = getDatabaseTables({
      column: {
        type: SchemaType.Number,
        definitions: {
          value: 123
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
        tables: [
          {
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'column' AND "table_name" = 'table')`,
            query: `ALTER TABLE IF EXISTS "table" ALTER COLUMN "column" TYPE decimal USING "column"::decimal`
          }
        ],
        constraints: [
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_column_tmp_ck'`,
            assert: 'SELECT 1 FROM "table" WHERE NOT "column" = 123 LIMIT 1',
            query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_column_tmp_ck" CHECK ("column" = 123) NOT VALID`,
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
            retry: `SELECT 1 FROM "pg_stat_activity" WHERE "state" = 'active' AND ("query" LIKE 'ALTER TABLE' || '%' AND "query" LIKE '%' || '"table_column_tmp_ck"' || '%') LIMIT 1`,
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
            query: 'ALTER TABLE IF EXISTS "table" RENAME CONSTRAINT "table_column_tmp_ck" TO "table_column_ck"'
          }
        ],
        validations: [],
        relations: [],
        indexes: []
      }
    });
  });

  it('assert :: create (with literal string column type)', async () => {
    const sourceTable = getDatabaseTables({
      column: {
        type: SchemaType.Number
      }
    });

    const targetTable = getDatabaseTables({
      column: {
        type: SchemaType.String,
        definitions: {
          value: 'foo'
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
        tables: [
          {
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'column' AND "table_name" = 'table')`,
            query: `ALTER TABLE IF EXISTS "table" ALTER COLUMN "column" TYPE text USING "column"::text`
          }
        ],
        constraints: [
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_column_tmp_ck'`,
            assert: `SELECT 1 FROM "table" WHERE NOT "column" = 'foo' LIMIT 1`,
            query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_column_tmp_ck" CHECK ("column" = 'foo') NOT VALID`,
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
            retry: `SELECT 1 FROM "pg_stat_activity" WHERE "state" = 'active' AND ("query" LIKE 'ALTER TABLE' || '%' AND "query" LIKE '%' || '"table_column_tmp_ck"' || '%') LIMIT 1`,
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
            query: 'ALTER TABLE IF EXISTS "table" RENAME CONSTRAINT "table_column_tmp_ck" TO "table_column_ck"'
          }
        ],
        validations: [],
        relations: [],
        indexes: []
      }
    });
  });

  it('assert :: create (without column type change)', () => {
    const sourceTable = getDatabaseTables({
      column: {
        type: SchemaType.String
      }
    });

    const targetTable = getDatabaseTables({
      column: {
        type: SchemaType.String,
        definitions: {
          value: 'foo'
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
            assert: `SELECT 1 FROM "table" WHERE NOT "column" = 'foo' LIMIT 1`,
            query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_column_tmp_ck" CHECK ("column" = 'foo') NOT VALID`,
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
            retry: `SELECT 1 FROM "pg_stat_activity" WHERE "state" = 'active' AND ("query" LIKE 'ALTER TABLE' || '%' AND "query" LIKE '%' || '"table_column_tmp_ck"' || '%') LIMIT 1`,
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
            query: 'ALTER TABLE IF EXISTS "table" RENAME CONSTRAINT "table_column_tmp_ck" TO "table_column_ck"'
          }
        ],
        validations: [],
        relations: [],
        indexes: []
      }
    });
  });
});
