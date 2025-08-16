import type { ObjectSchemaProperties } from '@ez4/schema';

import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getUpdateQueries } from '@ez4/pgmigration';
import { getTableRepository } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

describe('migration update column tests', () => {
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

  it('assert :: alter table (alter column type)', async () => {
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

    deepEqual(queries.tables, [
      `ALTER TABLE IF EXISTS "table" ` +
        //
        `ALTER COLUMN "column" TYPE text USING "column"::text, ` +
        `ALTER COLUMN "default" TYPE text USING "default"::text, ` +
        `ALTER COLUMN "default" SET DEFAULT 'foo', ` +
        `ALTER COLUMN "nullable" TYPE text USING "nullable"::text`
    ]);

    deepEqual(queries.relations, []);
    deepEqual(queries.indexes, []);
  });

  it('assert :: alter table (alter default column)', async () => {
    const targetTable = getDatabaseTables({
      id: {
        type: SchemaType.String
      },
      column: {
        type: SchemaType.Boolean
      },
      default: {
        type: SchemaType.Boolean,
        definitions: {
          default: true
        }
      },
      nullable: {
        type: SchemaType.Boolean,
        optional: true,
        nullable: true
      }
    });

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries.tables, [
      `ALTER TABLE IF EXISTS "table" ` +
        //
        `ALTER COLUMN "default" SET DEFAULT true`
    ]);

    deepEqual(queries.relations, []);
    deepEqual(queries.indexes, []);
  });

  it('assert :: alter table (alter nullable column)', async () => {
    const targetTable = getDatabaseTables({
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
        optional: false,
        nullable: false
      }
    });

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries.tables, [
      `ALTER TABLE IF EXISTS "table" ` +
        //
        `ALTER COLUMN "default" SET DEFAULT false, ` +
        `ALTER COLUMN "nullable" DROP NOT null`
    ]);

    deepEqual(queries.relations, []);
    deepEqual(queries.indexes, []);
  });

  it('assert :: alter table (rename column)', async () => {
    const targetTable = getDatabaseTables({
      id: {
        type: SchemaType.String
      },
      column_renamed: {
        type: SchemaType.Boolean
      },
      renamed_default: {
        type: SchemaType.Boolean,
        definitions: {
          default: false
        }
      },
      nullable_renamed: {
        type: SchemaType.Boolean,
        optional: true,
        nullable: true
      }
    });

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries.tables, [
      `ALTER TABLE "table" RENAME COLUMN "column" TO "column_renamed"`,
      `ALTER TABLE "table" RENAME COLUMN "default" TO "renamed_default"`,
      `ALTER TABLE "table" RENAME COLUMN "nullable" TO "nullable_renamed"`
    ]);

    deepEqual(queries.relations, []);
    deepEqual(queries.indexes, []);
  });
});
