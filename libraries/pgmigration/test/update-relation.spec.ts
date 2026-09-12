import { deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { getUpdateStepQueries } from '@ez4/pgmigration';
import { getTableRepository } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

describe('migration :: update relation tests', () => {
  const getDatabaseTables = (nullable: boolean) => {
    return getTableRepository([
      {
        name: 'table_a',
        indexes: [],
        relations: [
          {
            sourceTable: 'table_b',
            sourceColumn: 'column_b',
            sourceIndex: Index.Primary,
            targetAlias: 'relation',
            targetColumn: 'column_a',
            targetIndex: Index.Secondary
          }
        ],
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

  it('assert :: update relation (set mandatory)', async () => {
    const sourceTable = getDatabaseTables(true);
    const targetTable = getDatabaseTables(false);

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
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'column_a' AND "table_name" = 'table_a')`,
            query: `ALTER TABLE IF EXISTS "table_a" ALTER COLUMN "column_a" SET NOT null`
          }
        ],
        constraints: [],
        validations: [
          {
            query: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = false AND "conname" = 'table_a_relation_tmp_fk'`,
            name: 'table_a_relation_fk'
          }
        ],
        relations: [
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_a_relation_tmp_fk'`,
            query:
              `ALTER TABLE IF EXISTS "table_a" ADD CONSTRAINT "table_a_relation_tmp_fk" ` +
              `FOREIGN KEY ("column_a") REFERENCES "table_b" ("column_b") ` +
              `ON DELETE CASCADE ` +
              `ON UPDATE CASCADE`
          }
        ],
        indexes: []
      },
      delete: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [
          {
            query: `ALTER TABLE IF EXISTS "table_a" DROP CONSTRAINT IF EXISTS "table_a_relation_fk"`
          },
          {
            query: 'ALTER TABLE IF EXISTS "table_a" RENAME CONSTRAINT "table_a_relation_tmp_fk" TO "table_a_relation_fk"'
          }
        ],
        indexes: []
      }
    });
  });

  it('assert :: update relation (set nullable)', async () => {
    const sourceTable = getDatabaseTables(false);
    const targetTable = getDatabaseTables(true);

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
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'column_a' AND "table_name" = 'table_a')`,
            query: `ALTER TABLE IF EXISTS "table_a" ALTER COLUMN "column_a" DROP NOT null`
          }
        ],
        constraints: [],
        validations: [
          {
            query: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = false AND "conname" = 'table_a_relation_tmp_fk'`,
            name: 'table_a_relation_fk'
          }
        ],
        relations: [
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_a_relation_tmp_fk'`,
            query:
              `ALTER TABLE IF EXISTS "table_a" ADD CONSTRAINT "table_a_relation_tmp_fk" ` +
              `FOREIGN KEY ("column_a") REFERENCES "table_b" ("column_b") ` +
              `ON DELETE SET null ` +
              `ON UPDATE CASCADE`
          }
        ],
        indexes: []
      },
      delete: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [
          {
            query: `ALTER TABLE IF EXISTS "table_a" DROP CONSTRAINT IF EXISTS "table_a_relation_fk"`
          },
          {
            query: 'ALTER TABLE IF EXISTS "table_a" RENAME CONSTRAINT "table_a_relation_tmp_fk" TO "table_a_relation_fk"'
          }
        ],
        indexes: []
      }
    });
  });

  it('assert :: update relation source column', () => {
    const sourceTable = getDatabaseTables(false);
    const baseTarget = getDatabaseTables(false);

    const targetTable = {
      ...baseTarget,
      table_a: {
        ...baseTarget.table_a,
        relations: {
          relation: {
            ...baseTarget.table_a.relations.relation,
            sourceColumn: 'other_column'
          }
        }
      }
    };

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
        validations: [
          {
            query: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = false AND "conname" = 'table_a_relation_tmp_fk'`,
            name: 'table_a_relation_fk'
          }
        ],
        relations: [
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_a_relation_tmp_fk'`,
            query:
              `ALTER TABLE IF EXISTS "table_a" ADD CONSTRAINT "table_a_relation_tmp_fk" ` +
              `FOREIGN KEY ("column_a") REFERENCES "table_b" ("other_column") ` +
              `ON DELETE CASCADE ` +
              `ON UPDATE CASCADE`
          }
        ],
        indexes: []
      },
      delete: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [
          {
            query: 'ALTER TABLE IF EXISTS "table_a" DROP CONSTRAINT IF EXISTS "table_a_relation_fk"'
          },
          {
            query: 'ALTER TABLE IF EXISTS "table_a" RENAME CONSTRAINT "table_a_relation_tmp_fk" TO "table_a_relation_fk"'
          }
        ],
        indexes: []
      }
    });
  });

  it('assert :: update relation to secondary source', () => {
    const sourceTable = getDatabaseTables(false);
    const baseTarget = getDatabaseTables(false);

    const targetTable = {
      ...baseTarget,
      table_a: {
        ...baseTarget.table_a,
        relations: {
          relation: {
            ...baseTarget.table_a.relations.relation,
            sourceIndex: Index.Secondary
          }
        }
      }
    };

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
        relations: [
          {
            query: 'ALTER TABLE IF EXISTS "table_a" DROP CONSTRAINT IF EXISTS "table_a_relation_fk"'
          }
        ],
        indexes: []
      }
    });
  });
});
