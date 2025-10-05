import type { ObjectSchemaProperties } from '@ez4/schema';

import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getUpdateQueries } from '@ez4/pgmigration';
import { getTableRepository } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

describe('migration :: update column tests', () => {
  const getDatabaseTables = (properties: ObjectSchemaProperties) => {
    return getTableRepository([
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

  it('assert :: alter table (alter column type)', async () => {
    const sourceTable = getDatabaseTables({
      id: {
        type: SchemaType.String
      },
      column: {
        type: SchemaType.Boolean
      },
      default: {
        type: SchemaType.Boolean,
        definitions: {
          default: false
        }
      },
      nullable: {
        type: SchemaType.Boolean,
        optional: true,
        nullable: true
      }
    });

    const targetTable = getDatabaseTables({
      id: {
        type: SchemaType.String
      },
      column: {
        type: SchemaType.String
      },
      default: {
        type: SchemaType.String,
        definitions: {
          default: 'foo'
        }
      },
      nullable: {
        type: SchemaType.String,
        optional: true,
        nullable: true
      }
    });

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries, {
      tables: [
        {
          check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'column' AND "table_name" = 'table')`,
          query: `ALTER TABLE IF EXISTS "table" ALTER COLUMN "column" TYPE text USING "column"::text`
        },
        {
          check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'default' AND "table_name" = 'table')`,
          query: `ALTER TABLE IF EXISTS "table" ALTER COLUMN "default" TYPE text USING "default"::text, ALTER COLUMN "default" SET DEFAULT 'foo'`
        },
        {
          check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'nullable' AND "table_name" = 'table')`,
          query: `ALTER TABLE IF EXISTS "table" ALTER COLUMN "nullable" TYPE text USING "nullable"::text`
        }
      ],
      constraints: [],
      relations: [],
      indexes: []
    });
  });

  it('assert :: alter table (make default column)', async () => {
    const sourceTable = getDatabaseTables({
      default: {
        type: SchemaType.Boolean
      }
    });

    const targetTable = getDatabaseTables({
      default: {
        type: SchemaType.Boolean,
        definitions: {
          default: false
        }
      }
    });

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries, {
      tables: [
        {
          check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'default' AND "table_name" = 'table')`,
          query: `ALTER TABLE IF EXISTS "table" ALTER COLUMN "default" SET DEFAULT false`
        }
      ],
      constraints: [],
      relations: [],
      indexes: []
    });
  });

  it('assert :: alter table (alter default column)', async () => {
    const sourceTable = getDatabaseTables({
      default: {
        type: SchemaType.Boolean,
        definitions: {
          default: false
        }
      }
    });

    const targetTable = getDatabaseTables({
      default: {
        type: SchemaType.Boolean,
        definitions: {
          default: true
        }
      }
    });

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries, {
      tables: [
        {
          check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'default' AND "table_name" = 'table')`,
          query: `ALTER TABLE IF EXISTS "table" ALTER COLUMN "default" SET DEFAULT true`
        }
      ],
      constraints: [],
      relations: [],
      indexes: []
    });
  });

  it('assert :: alter table (drop default column)', async () => {
    const sourceTable = getDatabaseTables({
      default: {
        type: SchemaType.Boolean,
        definitions: {
          default: true
        }
      }
    });

    const targetTable = getDatabaseTables({
      default: {
        type: SchemaType.Boolean
      }
    });

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries, {
      tables: [
        {
          check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'default' AND "table_name" = 'table')`,
          query: `ALTER TABLE IF EXISTS "table" ALTER COLUMN "default" DROP DEFAULT`
        }
      ],
      constraints: [],
      relations: [],
      indexes: []
    });
  });

  it('assert :: alter table (make required column)', async () => {
    const sourceTable = getDatabaseTables({
      nullable: {
        type: SchemaType.Boolean,
        optional: true,
        nullable: true
      }
    });

    const targetTable = getDatabaseTables({
      nullable: {
        type: SchemaType.Boolean,
        optional: false,
        nullable: false
      }
    });

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries, {
      tables: [
        {
          check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'nullable' AND "table_name" = 'table')`,
          query: `ALTER TABLE IF EXISTS "table" ALTER COLUMN "nullable" SET NOT null`
        }
      ],
      constraints: [],
      relations: [],
      indexes: []
    });
  });

  it('assert :: alter table (make optional column)', async () => {
    const sourceTable = getDatabaseTables({
      nullable: {
        type: SchemaType.Boolean
      }
    });

    const targetTable = getDatabaseTables({
      nullable: {
        type: SchemaType.Boolean,
        optional: true,
        nullable: true
      }
    });

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries, {
      tables: [
        {
          check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'nullable' AND "table_name" = 'table')`,
          query: `ALTER TABLE IF EXISTS "table" ALTER COLUMN "nullable" DROP NOT null`
        }
      ],
      constraints: [],
      relations: [],
      indexes: []
    });
  });

  it('assert :: alter table (rename column)', async () => {
    const options = [
      {
        value: 123
      },
      {
        value: 'foo'
      }
    ];

    const sourceTable = getDatabaseTables({
      column: {
        type: SchemaType.String
      },
      enumerable: {
        type: SchemaType.Enum,
        options
      }
    });

    const targetTable = getDatabaseTables({
      renamed_column: {
        type: SchemaType.String
      },
      enumerable_renamed: {
        type: SchemaType.Enum,
        options
      }
    });

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries, {
      tables: [
        {
          check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'column' AND "table_name" = 'table')`,
          query: `ALTER TABLE IF EXISTS "table" RENAME COLUMN "column" TO "renamed_column"`
        },
        {
          check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'enumerable' AND "table_name" = 'table')`,
          query: `ALTER TABLE IF EXISTS "table" RENAME COLUMN "enumerable" TO "enumerable_renamed"`
        }
      ],
      constraints: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_enumerable_renamed_ck'`,
          query: `ALTER TABLE IF EXISTS "table" RENAME CONSTRAINT "table_enumerable_ck" TO "table_enumerable_renamed_ck"`
        }
      ],
      relations: [],
      indexes: []
    });
  });
});
