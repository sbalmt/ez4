import type { TableRelation } from '@ez4/database/library';

import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getCreateQueries, getUpdateStepQueries } from '@ez4/pgmigration';
import { getTableRepository } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

describe('migration :: create relation tests', () => {
  const getDatabaseTables = (nullable: boolean, relations: TableRelation[]) => {
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
              optional: nullable,
              nullable: nullable
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

  it('assert :: create (with table)', () => {
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

    targetTable.table_b.indexes = {
      column_b: {
        name: 'column_b',
        type: Index.Primary,
        columns: ['column_b']
      }
    };

    const queries = getCreateQueries(targetTable);

    deepEqual(queries, {
      tables: [
        {
          query: 'CREATE TABLE IF NOT EXISTS "table_a" ("column_a" text NOT null)'
        },
        {
          query: 'CREATE TABLE IF NOT EXISTS "table_b" ("column_b" text NOT null)'
        }
      ],
      constraints: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_b_column_b_pk'`,
          query: 'ALTER TABLE IF EXISTS "table_b" ADD CONSTRAINT "table_b_column_b_pk" PRIMARY KEY ("column_b")'
        }
      ],
      validations: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = false AND "conname" = 'table_a_relation_fk'`,
          retry: `SELECT 1 FROM "pg_stat_activity" WHERE "state" = 'active' AND ("query" LIKE 'ALTER TABLE' || '%' AND "query" LIKE '%' || '"table_a_relation_fk"' || '%') LIMIT 1`,
          name: 'table_a_relation_fk'
        }
      ],
      relations: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_a_relation_fk'`,
          query:
            'ALTER TABLE IF EXISTS "table_a" ADD CONSTRAINT "table_a_relation_fk" ' +
            'FOREIGN KEY ("column_a") REFERENCES "table_b" ("column_b") ' +
            'ON DELETE CASCADE ON UPDATE CASCADE NOT VALID'
        },
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = true AND "conname" = 'table_a_relation_fk'`,
          query: 'ALTER TABLE IF EXISTS "table_a" VALIDATE CONSTRAINT "table_a_relation_fk"'
        }
      ],
      indexes: []
    });
  });

  it('assert :: create (nullable with table)', () => {
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

    targetTable.table_b.indexes = {
      column_b: {
        name: 'column_b',
        type: Index.Primary,
        columns: ['column_b']
      }
    };

    const queries = getCreateQueries(targetTable);

    deepEqual(queries, {
      tables: [
        {
          query: 'CREATE TABLE IF NOT EXISTS "table_a" ("column_a" text DEFAULT null)'
        },
        {
          query: 'CREATE TABLE IF NOT EXISTS "table_b" ("column_b" text NOT null)'
        }
      ],
      constraints: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_b_column_b_pk'`,
          query: 'ALTER TABLE IF EXISTS "table_b" ADD CONSTRAINT "table_b_column_b_pk" PRIMARY KEY ("column_b")'
        }
      ],
      validations: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = false AND "conname" = 'table_a_relation_fk'`,
          retry: `SELECT 1 FROM "pg_stat_activity" WHERE "state" = 'active' AND ("query" LIKE 'ALTER TABLE' || '%' AND "query" LIKE '%' || '"table_a_relation_fk"' || '%') LIMIT 1`,
          name: 'table_a_relation_fk'
        }
      ],
      relations: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_a_relation_fk'`,
          query:
            'ALTER TABLE IF EXISTS "table_a" ADD CONSTRAINT "table_a_relation_fk" ' +
            'FOREIGN KEY ("column_a") REFERENCES "table_b" ("column_b") ' +
            'ON DELETE SET null ON UPDATE CASCADE NOT VALID'
        },
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = true AND "conname" = 'table_a_relation_fk'`,
          query: 'ALTER TABLE IF EXISTS "table_a" VALIDATE CONSTRAINT "table_a_relation_fk"'
        }
      ],
      indexes: []
    });
  });

  it('assert :: create (mandatory)', async () => {
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
        constraints: [],
        validations: [
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = false AND "conname" = 'table_a_relation_fk'`,
            retry: `SELECT 1 FROM "pg_stat_activity" WHERE "state" = 'active' AND ("query" LIKE 'ALTER TABLE' || '%' AND "query" LIKE '%' || '"table_a_relation_fk"' || '%') LIMIT 1`,
            name: 'table_a_relation_fk'
          }
        ],
        relations: [
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_a_relation_fk'`,
            query:
              `ALTER TABLE IF EXISTS "table_a" ADD CONSTRAINT "table_a_relation_fk" ` +
              `FOREIGN KEY ("column_a") REFERENCES "table_b" ("column_b") ` +
              `ON DELETE CASCADE ` +
              `ON UPDATE CASCADE ` +
              `NOT VALID`
          },
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = true AND "conname" = 'table_a_relation_fk'`,
            query: `ALTER TABLE IF EXISTS "table_a" VALIDATE CONSTRAINT "table_a_relation_fk"`
          }
        ],
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

  it('assert :: create (nullable)', async () => {
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
        constraints: [],
        validations: [
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = false AND "conname" = 'table_a_relation_fk'`,
            retry: `SELECT 1 FROM "pg_stat_activity" WHERE "state" = 'active' AND ("query" LIKE 'ALTER TABLE' || '%' AND "query" LIKE '%' || '"table_a_relation_fk"' || '%') LIMIT 1`,
            name: 'table_a_relation_fk'
          }
        ],
        relations: [
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_a_relation_fk'`,
            query:
              `ALTER TABLE IF EXISTS "table_a" ADD CONSTRAINT "table_a_relation_fk" ` +
              `FOREIGN KEY ("column_a") REFERENCES "table_b" ("column_b") ` +
              `ON DELETE SET null ` +
              `ON UPDATE CASCADE ` +
              `NOT VALID`
          },
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = true AND "conname" = 'table_a_relation_fk'`,
            query: `ALTER TABLE IF EXISTS "table_a" VALIDATE CONSTRAINT "table_a_relation_fk"`
          }
        ],
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

  it('assert :: create (with table rename)', () => {
    const sourceTable = getDatabaseTables(false, []);

    const newTable = getDatabaseTables(false, [
      {
        sourceTable: 'table_b',
        sourceColumn: 'column_b',
        sourceIndex: Index.Primary,
        targetAlias: 'relation',
        targetColumn: 'column_a',
        targetIndex: Index.Secondary
      }
    ]);

    const targetTable = {
      table_b: newTable.table_b,
      renamed_table_a: {
        ...newTable.table_a,
        name: 'renamed_table_a'
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
            query: 'ALTER TABLE IF EXISTS "table_a" RENAME TO "renamed_table_a"'
          }
        ],
        constraints: [],
        validations: [
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = false AND "conname" = 'renamed_table_a_relation_fk'`,
            retry: `SELECT 1 FROM "pg_stat_activity" WHERE "state" = 'active' AND ("query" LIKE 'ALTER TABLE' || '%' AND "query" LIKE '%' || '"renamed_table_a_relation_fk"' || '%') LIMIT 1`,
            name: 'renamed_table_a_relation_fk'
          }
        ],
        relations: [
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'renamed_table_a_relation_fk'`,
            query:
              'ALTER TABLE IF EXISTS "renamed_table_a" ADD CONSTRAINT "renamed_table_a_relation_fk" ' +
              'FOREIGN KEY ("column_a") REFERENCES "table_b" ("column_b") ' +
              'ON DELETE CASCADE ON UPDATE CASCADE NOT VALID'
          },
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = true AND "conname" = 'renamed_table_a_relation_fk'`,
            query: 'ALTER TABLE IF EXISTS "renamed_table_a" VALIDATE CONSTRAINT "renamed_table_a_relation_fk"'
          }
        ],
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
