import type { ObjectSchemaProperties } from '@ez4/schema';

import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getUpdateStepQueries } from '@ez4/pgmigration';
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
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'default' AND "table_name" = 'table')`,
            query: `ALTER TABLE IF EXISTS "table" ALTER COLUMN "default" SET DEFAULT false`
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
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'default' AND "table_name" = 'table')`,
            query: `ALTER TABLE IF EXISTS "table" ALTER COLUMN "default" SET DEFAULT true`
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
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'default' AND "table_name" = 'table')`,
            query: `ALTER TABLE IF EXISTS "table" ALTER COLUMN "default" DROP DEFAULT`
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

  it('assert :: alter table (drop default column with constraint)', async () => {
    const sourceTable = getDatabaseTables({
      default: {
        type: SchemaType.Enum,
        definitions: {
          default: 'foo'
        },
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
      default: {
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
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'default' AND "table_name" = 'table')`,
            query: 'ALTER TABLE IF EXISTS "table" ALTER COLUMN "default" DROP DEFAULT'
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

  it('assert :: alter table (make required column, explicit)', async () => {
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
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'nullable' AND "table_name" = 'table')`,
            query: `ALTER TABLE IF EXISTS "table" ALTER COLUMN "nullable" SET NOT null`
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

  it('assert :: alter table (make required column, implicit)', async () => {
    const sourceTable = getDatabaseTables({
      nullable: {
        type: SchemaType.Boolean,
        optional: true,
        nullable: true
      }
    });

    const targetTable = getDatabaseTables({
      nullable: {
        type: SchemaType.Boolean
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
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'nullable' AND "table_name" = 'table')`,
            query: `ALTER TABLE IF EXISTS "table" ALTER COLUMN "nullable" SET NOT null`
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
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'nullable' AND "table_name" = 'table')`,
            query: `ALTER TABLE IF EXISTS "table" ALTER COLUMN "nullable" DROP NOT null`
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

  it('assert :: alter table (combined nullability flags)', () => {
    const sourceTable = getDatabaseTables({
      optional: {
        type: SchemaType.String,
        optional: true,
        nullable: true
      },
      nullable: {
        type: SchemaType.String,
        optional: true,
        nullable: true
      },
      required: {
        type: SchemaType.String,
        optional: true,
        nullable: false
      }
    });

    const targetTable = getDatabaseTables({
      optional: {
        type: SchemaType.String,
        optional: true,
        nullable: false
      },
      nullable: {
        type: SchemaType.String,
        nullable: true
      },
      required: {
        type: SchemaType.String,
        optional: false,
        nullable: false
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
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'optional' AND "table_name" = 'table')`,
            query: 'ALTER TABLE IF EXISTS "table" ALTER COLUMN "optional" DROP NOT null'
          },
          {
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'nullable' AND "table_name" = 'table')`,
            query: 'ALTER TABLE IF EXISTS "table" ALTER COLUMN "nullable" DROP NOT null'
          },
          {
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'required' AND "table_name" = 'table')`,
            query: 'ALTER TABLE IF EXISTS "table" ALTER COLUMN "required" SET NOT null'
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

  it('assert :: alter table (integer column to decimal)', () => {
    const sourceTable = getDatabaseTables({
      integer: {
        type: SchemaType.Number,
        format: 'integer'
      }
    });

    const targetTable = getDatabaseTables({
      integer: {
        type: SchemaType.Number
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
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'integer' AND "table_name" = 'table')`,
            query: 'ALTER TABLE IF EXISTS "table" ALTER COLUMN "integer" TYPE decimal USING "integer"::decimal'
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

  it('assert :: alter table (decimal column to integer)', () => {
    const sourceTable = getDatabaseTables({
      decimal: {
        type: SchemaType.Number
      }
    });

    const targetTable = getDatabaseTables({
      decimal: {
        type: SchemaType.Number,
        format: 'integer'
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
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'decimal' AND "table_name" = 'table')`,
            query: 'ALTER TABLE IF EXISTS "table" ALTER COLUMN "decimal" TYPE bigint USING "decimal"::bigint'
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

  it('assert :: alter table (text column to uuid)', () => {
    const sourceTable = getDatabaseTables({
      identifier: {
        type: SchemaType.String
      }
    });

    const targetTable = getDatabaseTables({
      identifier: {
        type: SchemaType.String,
        format: 'uuid'
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
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'identifier' AND "table_name" = 'table')`,
            query: 'ALTER TABLE IF EXISTS "table" ALTER COLUMN "identifier" TYPE uuid USING "identifier"::uuid'
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

  it('assert :: alter table (uuid column to text)', () => {
    const sourceTable = getDatabaseTables({
      text: {
        type: SchemaType.String,
        format: 'uuid'
      }
    });

    const targetTable = getDatabaseTables({
      text: {
        type: SchemaType.String
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
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'text' AND "table_name" = 'table')`,
            query: 'ALTER TABLE IF EXISTS "table" ALTER COLUMN "text" TYPE text USING "text"::text'
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

  it('assert :: alter table (add column maximum length)', () => {
    const sourceTable = getDatabaseTables({
      bounded: {
        type: SchemaType.String
      }
    });

    const targetTable = getDatabaseTables({
      bounded: {
        type: SchemaType.String,
        definitions: {
          maxLength: 20
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
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'bounded' AND "table_name" = 'table')`,
            query: 'ALTER TABLE IF EXISTS "table" ALTER COLUMN "bounded" TYPE varchar(20) USING "bounded"::varchar(20)'
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

  it('assert :: alter table (increase column maximum length)', () => {
    const sourceTable = getDatabaseTables({
      longer: {
        type: SchemaType.String,
        definitions: {
          maxLength: 20
        }
      }
    });

    const targetTable = getDatabaseTables({
      longer: {
        type: SchemaType.String,
        definitions: {
          maxLength: 100
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
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'longer' AND "table_name" = 'table')`,
            query: 'ALTER TABLE IF EXISTS "table" ALTER COLUMN "longer" TYPE varchar(100) USING "longer"::varchar(100)'
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

  it('assert :: alter table (remove column maximum length)', () => {
    const sourceTable = getDatabaseTables({
      unbounded: {
        type: SchemaType.String,
        definitions: {
          maxLength: 20
        }
      }
    });

    const targetTable = getDatabaseTables({
      unbounded: {
        type: SchemaType.String
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
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'unbounded' AND "table_name" = 'table')`,
            query: 'ALTER TABLE IF EXISTS "table" ALTER COLUMN "unbounded" TYPE text USING "unbounded"::text'
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

  it('assert :: alter table (empty string default within existing definitions)', () => {
    const sourceTable = getDatabaseTables({
      default_added: {
        type: SchemaType.String,
        definitions: {
          maxLength: 20
        }
      }
    });

    const targetTable = getDatabaseTables({
      default_added: {
        type: SchemaType.String,
        definitions: {
          maxLength: 20,
          default: ''
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
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'default_added' AND "table_name" = 'table')`,
            query: 'ALTER TABLE IF EXISTS "table" ALTER COLUMN "default_added" SET DEFAULT \'\''
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

  it('assert :: alter table (remove default from existing definitions)', () => {
    const sourceTable = getDatabaseTables({
      default_removed: {
        type: SchemaType.String,
        definitions: {
          maxLength: 20,
          default: 'old'
        }
      }
    });

    const targetTable = getDatabaseTables({
      default_removed: {
        type: SchemaType.String,
        definitions: {
          maxLength: 20
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
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'default_removed' AND "table_name" = 'table')`,
            query: 'ALTER TABLE IF EXISTS "table" ALTER COLUMN "default_removed" DROP DEFAULT'
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

  it('assert :: alter table (nested and falsy defaults)', () => {
    const sourceTable = getDatabaseTables({
      boolean: {
        type: SchemaType.Boolean,
        definitions: {
          value: false
        }
      },
      object: {
        type: SchemaType.Object,
        properties: {},
        definitions: {
          default: {
            version: 1
          }
        }
      },
      number: {
        type: SchemaType.Number,
        definitions: {
          value: 0
        }
      }
    });

    const targetTable = getDatabaseTables({
      boolean: {
        type: SchemaType.Boolean,
        definitions: {
          value: false,
          default: false
        }
      },
      object: {
        type: SchemaType.Object,
        properties: {},
        definitions: {
          default: {
            version: 2
          }
        }
      },
      number: {
        type: SchemaType.Number,
        definitions: {
          value: 0,
          default: 0
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
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'boolean' AND "table_name" = 'table')`,
            query: 'ALTER TABLE IF EXISTS "table" ALTER COLUMN "boolean" SET DEFAULT false'
          },
          {
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'object' AND "table_name" = 'table')`,
            query: 'ALTER TABLE IF EXISTS "table" ALTER COLUMN "object" SET DEFAULT \'{"version":2}\''
          },
          {
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'number' AND "table_name" = 'table')`,
            query: 'ALTER TABLE IF EXISTS "table" ALTER COLUMN "number" SET DEFAULT 0'
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

  it('assert :: alter table (integer primary column format)', () => {
    const sourceTable = getDatabaseTables({
      id: {
        type: SchemaType.Number
      }
    });

    const targetTable = getDatabaseTables({
      id: {
        type: SchemaType.Number,
        format: 'integer'
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
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'id' AND "table_name" = 'table')`,
            query: 'ALTER TABLE IF EXISTS "table" ALTER COLUMN "id" TYPE bigint USING "id"::bigint'
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
