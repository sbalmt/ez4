import type { ObjectSchema } from '@ez4/schema';

import { deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { getUpdateStepQueries } from '@ez4/pgmigration';
import { getTableRepository } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

describe('migration :: update table tests', () => {
  const sourceTable = getTableRepository([
    {
      name: 'table',
      schema: {
        type: SchemaType.Object,
        properties: {
          id: {
            type: SchemaType.String
          },
          column_a: {
            type: SchemaType.Boolean
          },
          column_b: {
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
        }
      },
      relations: [
        {
          sourceColumn: 'id',
          sourceTable: 'table_relation',
          targetAlias: 'relation',
          targetColumn: 'column_b',
          sourceIndex: Index.Primary,
          targetIndex: Index.Unique
        }
      ],
      indexes: [
        {
          name: 'id',
          type: Index.Primary,
          columns: ['id']
        },
        {
          name: 'column_a',
          type: Index.Secondary,
          columns: ['column_a']
        },
        {
          name: 'column_b',
          type: Index.Unique,
          columns: ['column_b']
        }
      ]
    }
  ]);

  it('assert :: rename table', async () => {
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
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'renamed_table_column_b_ck'`,
            query: 'ALTER TABLE IF EXISTS "renamed_table" RENAME CONSTRAINT "table_column_b_ck" TO "renamed_table_column_b_ck"'
          },
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'renamed_table_id_pk'`,
            query: 'ALTER TABLE IF EXISTS "renamed_table" RENAME CONSTRAINT "table_id_pk" TO "renamed_table_id_pk"'
          }
        ],
        validations: [],
        relations: [
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'renamed_table_relation_fk'`,
            query: 'ALTER TABLE IF EXISTS "renamed_table" RENAME CONSTRAINT "table_relation_fk" TO "renamed_table_relation_fk"'
          }
        ],
        indexes: [
          {
            query: 'ALTER INDEX IF EXISTS "table_column_a_sk" RENAME TO "renamed_table_column_a_sk"'
          },
          {
            query: 'ALTER INDEX IF EXISTS "table_column_b_uk" RENAME TO "renamed_table_column_b_uk"'
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

  it('assert :: rename table (unrelated name)', () => {
    const source = getTableRepository([
      {
        name: 'table',
        indexes: [],
        schema: {
          type: SchemaType.Object,
          properties: {
            id: {
              type: SchemaType.String
            }
          }
        }
      }
    ]);

    const target = {
      completely_different_name: {
        ...source.table,
        name: 'completely_different_name'
      }
    };

    const steps = getUpdateStepQueries(target, source);

    deepEqual(steps.rollout.tables, [
      {
        query: 'ALTER TABLE IF EXISTS "table" RENAME TO "completely_different_name"'
      }
    ]);
  });

  it('assert :: rename table with added column', () => {
    const source = getTableRepository([
      {
        name: 'table',
        indexes: [],
        schema: {
          type: SchemaType.Object,
          properties: {
            id: {
              type: SchemaType.String
            }
          }
        }
      }
    ]);

    const target = {
      renamed_table: {
        ...source.table,
        name: 'renamed_table',
        schema: {
          type: SchemaType.Object,
          properties: {
            id: {
              type: SchemaType.String
            },
            added: {
              type: SchemaType.String,
              optional: true
            }
          }
        } satisfies ObjectSchema
      }
    };

    const steps = getUpdateStepQueries(target, source);

    deepEqual(steps, {
      prepare: {
        tables: [
          {
            query: 'ALTER TABLE IF EXISTS "table" ADD COLUMN IF NOT EXISTS "added" text DEFAULT null'
          }
        ],
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

  it('assert :: rename table with updated column', async () => {
    const targetTable = {
      renamed_table: {
        ...sourceTable.table,
        name: 'renamed_table',
        schema: {
          ...sourceTable.table.schema,
          properties: {
            ...sourceTable.table.schema.properties,
            column_a: {
              type: SchemaType.String
            }
          }
        } satisfies ObjectSchema
      }
    };

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps.rollout.tables, [
      {
        query: 'ALTER TABLE IF EXISTS "table" RENAME TO "renamed_table"'
      },
      {
        check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'column_a' AND "table_name" = 'renamed_table')`,
        query: 'ALTER TABLE IF EXISTS "renamed_table" ALTER COLUMN "column_a" TYPE text USING "column_a"::text'
      }
    ]);
  });

  it('assert :: rename table with renamed column', () => {
    const source = getTableRepository([
      {
        name: 'table',
        indexes: [],
        schema: {
          type: SchemaType.Object,
          properties: {
            id: {
              type: SchemaType.String
            },
            column_a: {
              type: SchemaType.String
            }
          }
        }
      }
    ]);

    const target = {
      renamed_table: {
        ...source.table,
        name: 'renamed_table',
        schema: {
          ...source.table.schema,
          properties: {
            id: source.table.schema.properties.id,
            completely_different_column: source.table.schema.properties.column_a
          }
        } satisfies ObjectSchema
      }
    };

    const steps = getUpdateStepQueries(target, source);

    deepEqual(steps.rollout.tables, [
      {
        query: 'ALTER TABLE IF EXISTS "table" RENAME TO "renamed_table"'
      },
      {
        check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'column_a' AND "table_name" = 'renamed_table')`,
        query: 'ALTER TABLE IF EXISTS "renamed_table" RENAME COLUMN "column_a" TO "completely_different_column"'
      }
    ]);
  });
});
