import type { ObjectSchemaProperties } from '@ez4/schema';

import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getUpdateStepQueries } from '@ez4/pgmigration';
import { getTableRepository } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

describe('migration :: create column tests', () => {
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
    }
  });

  it('assert :: alter table (add boolean column)', async () => {
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
        optional: true,
        nullable: true
      }
    });

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      create: {
        tables: [
          {
            query:
              `ALTER TABLE IF EXISTS "table" ` +
              `ADD COLUMN IF NOT EXISTS "column" boolean NOT null, ` +
              `ADD COLUMN IF NOT EXISTS "default" boolean DEFAULT false NOT null, ` +
              `ADD COLUMN IF NOT EXISTS "nullable" boolean DEFAULT null`
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

  it('assert :: alter table (add integer column)', async () => {
    const targetTable = getDatabaseTables({
      id: {
        type: SchemaType.String
      },
      column: {
        type: SchemaType.Number,
        format: 'integer'
      },
      default: {
        type: SchemaType.Number,
        format: 'integer',
        definitions: {
          default: 123
        }
      },
      nullable: {
        type: SchemaType.Number,
        format: 'integer',
        optional: true,
        nullable: true
      }
    });

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      create: {
        tables: [
          {
            query:
              `ALTER TABLE IF EXISTS "table" ` +
              `ADD COLUMN IF NOT EXISTS "column" bigint NOT null, ` +
              `ADD COLUMN IF NOT EXISTS "default" bigint DEFAULT 123 NOT null, ` +
              `ADD COLUMN IF NOT EXISTS "nullable" bigint DEFAULT null`
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

  it('assert :: alter table (add decimal column)', async () => {
    const targetTable = getDatabaseTables({
      id: {
        type: SchemaType.String
      },
      column: {
        type: SchemaType.Number,
        format: 'decimal'
      },
      default: {
        type: SchemaType.Number,
        format: 'decimal',
        definitions: {
          default: 1.23
        }
      },
      nullable: {
        type: SchemaType.Number,
        format: 'decimal',
        optional: true,
        nullable: true
      }
    });

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      create: {
        tables: [
          {
            query:
              `ALTER TABLE IF EXISTS "table" ` +
              `ADD COLUMN IF NOT EXISTS "column" decimal NOT null, ` +
              `ADD COLUMN IF NOT EXISTS "default" decimal DEFAULT 1.23 NOT null, ` +
              `ADD COLUMN IF NOT EXISTS "nullable" decimal DEFAULT null`
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

  it('assert :: alter table (add numeric column)', async () => {
    const targetTable = getDatabaseTables({
      id: {
        type: SchemaType.String
      },
      column: {
        type: SchemaType.Number
      },
      default: {
        type: SchemaType.Number,
        definitions: {
          default: 12.34
        }
      },
      nullable: {
        type: SchemaType.Number,
        optional: true,
        nullable: true
      }
    });

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      create: {
        tables: [
          {
            query:
              `ALTER TABLE IF EXISTS "table" ` +
              `ADD COLUMN IF NOT EXISTS "column" decimal NOT null, ` +
              `ADD COLUMN IF NOT EXISTS "default" decimal DEFAULT 12.34 NOT null, ` +
              `ADD COLUMN IF NOT EXISTS "nullable" decimal DEFAULT null`
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

  it('assert :: alter table (add string column)', async () => {
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
      },
      limited: {
        type: SchemaType.String,
        definitions: {
          maxLength: 32
        }
      }
    });

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      create: {
        tables: [
          {
            query:
              `ALTER TABLE IF EXISTS "table" ` +
              `ADD COLUMN IF NOT EXISTS "column" text NOT null, ` +
              `ADD COLUMN IF NOT EXISTS "default" text DEFAULT 'foo' NOT null, ` +
              `ADD COLUMN IF NOT EXISTS "nullable" text DEFAULT null, ` +
              `ADD COLUMN IF NOT EXISTS "limited" varchar(32) NOT null`
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

  it('assert :: alter table (add datetime column)', async () => {
    const targetTable = getDatabaseTables({
      id: {
        type: SchemaType.String
      },
      column: {
        type: SchemaType.String,
        format: 'date-time'
      },
      default: {
        type: SchemaType.String,
        format: 'date-time',
        definitions: {
          default: '2025-01-01T00:00:00Z'
        }
      },
      nullable: {
        type: SchemaType.String,
        format: 'date-time',
        optional: true,
        nullable: true
      }
    });

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      create: {
        tables: [
          {
            query:
              `ALTER TABLE IF EXISTS "table" ` +
              `ADD COLUMN IF NOT EXISTS "column" timestamptz NOT null, ` +
              `ADD COLUMN IF NOT EXISTS "default" timestamptz DEFAULT '2025-01-01T00:00:00Z' NOT null, ` +
              `ADD COLUMN IF NOT EXISTS "nullable" timestamptz DEFAULT null`
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

  it('assert :: alter table (add date column)', async () => {
    const targetTable = getDatabaseTables({
      id: {
        type: SchemaType.String
      },
      column: {
        type: SchemaType.String,
        format: 'date'
      },
      default: {
        type: SchemaType.String,
        format: 'date',
        definitions: {
          default: '2025-01-01'
        }
      },
      nullable: {
        type: SchemaType.String,
        format: 'date',
        optional: true,
        nullable: true
      }
    });

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      create: {
        tables: [
          {
            query:
              `ALTER TABLE IF EXISTS "table" ` +
              `ADD COLUMN IF NOT EXISTS "column" date NOT null, ` +
              `ADD COLUMN IF NOT EXISTS "default" date DEFAULT '2025-01-01' NOT null, ` +
              `ADD COLUMN IF NOT EXISTS "nullable" date DEFAULT null`
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

  it('assert :: alter table (add time column)', async () => {
    const targetTable = getDatabaseTables({
      id: {
        type: SchemaType.String
      },
      column: {
        type: SchemaType.String,
        format: 'time'
      },
      default: {
        type: SchemaType.String,
        format: 'time',
        definitions: {
          default: '00:00:00'
        }
      },
      nullable: {
        type: SchemaType.String,
        format: 'time',
        optional: true,
        nullable: true
      }
    });

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      create: {
        tables: [
          {
            query:
              `ALTER TABLE IF EXISTS "table" ` +
              `ADD COLUMN IF NOT EXISTS "column" time NOT null, ` +
              `ADD COLUMN IF NOT EXISTS "default" time DEFAULT '00:00:00' NOT null, ` +
              `ADD COLUMN IF NOT EXISTS "nullable" time DEFAULT null`
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

  it('assert :: alter table (add uuid column)', async () => {
    const targetTable = getDatabaseTables({
      id: {
        type: SchemaType.String
      },
      column: {
        type: SchemaType.String,
        format: 'uuid'
      },
      default: {
        type: SchemaType.String,
        format: 'uuid',
        definitions: {
          default: '00000000-0000-1000-9000-000000000000'
        }
      },
      nullable: {
        type: SchemaType.String,
        format: 'uuid',
        optional: true,
        nullable: true
      }
    });

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      create: {
        tables: [
          {
            query:
              `ALTER TABLE IF EXISTS "table" ` +
              `ADD COLUMN IF NOT EXISTS "column" uuid NOT null, ` +
              `ADD COLUMN IF NOT EXISTS "default" uuid DEFAULT '00000000-0000-1000-9000-000000000000' NOT null, ` +
              `ADD COLUMN IF NOT EXISTS "nullable" uuid DEFAULT null`
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

  it('assert :: alter table (add enum column)', async () => {
    const targetTable = getDatabaseTables({
      id: {
        type: SchemaType.String
      },
      column: {
        type: SchemaType.Enum,
        options: []
      },
      default_a: {
        type: SchemaType.Enum,
        definitions: {
          default: 'foo'
        },
        options: [
          {
            value: 'foo'
          }
        ]
      },
      default_b: {
        type: SchemaType.Enum,
        definitions: {
          default: 123
        },
        options: [
          {
            value: 123
          }
        ]
      },
      nullable: {
        type: SchemaType.Enum,
        optional: true,
        nullable: true,
        options: []
      }
    });

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      create: {
        tables: [
          {
            query:
              `ALTER TABLE IF EXISTS "table" ` +
              `ADD COLUMN IF NOT EXISTS "column" text NOT null, ` +
              `ADD COLUMN IF NOT EXISTS "default_a" text DEFAULT 'foo' NOT null, ` +
              `ADD COLUMN IF NOT EXISTS "default_b" text DEFAULT '123' NOT null, ` +
              `ADD COLUMN IF NOT EXISTS "nullable" text DEFAULT null`
          }
        ],
        constraints: [
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_column_ck'`,
            assert: 'SELECT 1 FROM "table" WHERE NOT false LIMIT 1',
            query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_column_ck" CHECK (false)`,
            name: 'table_column_ck'
          },
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_default_a_ck'`,
            assert: `SELECT 1 FROM "table" WHERE NOT "default_a" IN ('foo') LIMIT 1`,
            query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_default_a_ck" CHECK ("default_a" IN ('foo'))`,
            name: 'table_default_a_ck'
          },
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_default_b_ck'`,
            assert: `SELECT 1 FROM "table" WHERE NOT "default_b" IN ('123') LIMIT 1`,
            query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_default_b_ck" CHECK ("default_b" IN ('123'))`,
            name: 'table_default_b_ck'
          },
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_nullable_ck'`,
            assert: 'SELECT 1 FROM "table" WHERE NOT false LIMIT 1',
            query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_nullable_ck" CHECK (false)`,
            name: 'table_nullable_ck'
          }
        ],
        validations: [
          {
            query: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = false AND "conname" = 'table_column_ck'`,
            name: 'table_column_ck'
          },
          {
            query: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = false AND "conname" = 'table_default_a_ck'`,
            name: 'table_default_a_ck'
          },
          {
            query: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = false AND "conname" = 'table_default_b_ck'`,
            name: 'table_default_b_ck'
          },
          {
            query: `SELECT 1 FROM "pg_constraint" WHERE "convalidated" = false AND "conname" = 'table_nullable_ck'`,
            name: 'table_nullable_ck'
          }
        ],
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

  it('assert :: alter table (add object column)', async () => {
    const targetTable = getDatabaseTables({
      id: {
        type: SchemaType.String
      },
      column: {
        type: SchemaType.Object,
        properties: {}
      },
      default: {
        type: SchemaType.Object,
        properties: {},
        definitions: {
          default: {
            foo: true,
            bar: 'bar',
            baz: 123
          }
        }
      },
      nullable: {
        type: SchemaType.Object,
        properties: {},
        optional: true,
        nullable: true
      }
    });

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      create: {
        tables: [
          {
            query:
              `ALTER TABLE IF EXISTS "table" ` +
              `ADD COLUMN IF NOT EXISTS "column" jsonb NOT null, ` +
              `ADD COLUMN IF NOT EXISTS "default" jsonb DEFAULT '{"foo":true,"bar":"bar","baz":123}' NOT null, ` +
              `ADD COLUMN IF NOT EXISTS "nullable" jsonb DEFAULT null`
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

  it('assert :: alter table (add array column)', async () => {
    const targetTable = getDatabaseTables({
      id: {
        type: SchemaType.String
      },
      column: {
        type: SchemaType.Array,
        element: {
          type: SchemaType.String
        }
      },
      default: {
        type: SchemaType.Array,
        definitions: {
          default: ['foo', 'bar']
        },
        element: {
          type: SchemaType.String
        }
      },
      nullable: {
        type: SchemaType.Array,
        optional: true,
        nullable: true,
        element: {
          type: SchemaType.String
        }
      }
    });

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      create: {
        tables: [
          {
            query:
              `ALTER TABLE IF EXISTS "table" ` +
              `ADD COLUMN IF NOT EXISTS "column" jsonb NOT null, ` +
              `ADD COLUMN IF NOT EXISTS "default" jsonb DEFAULT '["foo","bar"]' NOT null, ` +
              `ADD COLUMN IF NOT EXISTS "nullable" jsonb DEFAULT null`
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

  it('assert :: alter table (add tuple column)', async () => {
    const targetTable = getDatabaseTables({
      id: {
        type: SchemaType.String
      },
      column: {
        type: SchemaType.Tuple,
        elements: []
      },
      default: {
        type: SchemaType.Tuple,
        definitions: {
          default: ['foo', 123]
        },
        elements: [
          {
            type: SchemaType.String
          },
          {
            type: SchemaType.Number
          }
        ]
      },
      nullable: {
        type: SchemaType.Tuple,
        optional: true,
        nullable: true,
        elements: []
      }
    });

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      create: {
        tables: [
          {
            query:
              `ALTER TABLE IF EXISTS "table" ` +
              `ADD COLUMN IF NOT EXISTS "column" jsonb NOT null, ` +
              `ADD COLUMN IF NOT EXISTS "default" jsonb DEFAULT '["foo",123]' NOT null, ` +
              `ADD COLUMN IF NOT EXISTS "nullable" jsonb DEFAULT null`
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
});
