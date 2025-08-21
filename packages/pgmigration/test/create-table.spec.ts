import type { ObjectSchemaProperties } from '@ez4/schema';

import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getCreateQueries } from '@ez4/pgmigration';
import { getTableRepository } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

describe('migration :: create table tests', () => {
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

  it('assert :: create table (boolean columns)', async () => {
    const tables = getDatabaseTables({
      id: {
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

    const queries = getCreateQueries(tables);

    deepEqual(queries, {
      tables: [
        {
          query:
            `CREATE TABLE IF NOT EXISTS "table" (` +
            `"id" boolean NOT null, ` +
            `"default" boolean DEFAULT true NOT null, ` +
            `"nullable" boolean DEFAULT null` +
            `)`
        }
      ],
      indexes: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_id_pk'`,
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_id_pk" PRIMARY KEY ("id")`
        }
      ],
      constraints: [],
      relations: []
    });
  });

  it('assert :: create table (integer columns)', async () => {
    const tables = getDatabaseTables({
      id: {
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

    const queries = getCreateQueries(tables);

    deepEqual(queries, {
      tables: [
        {
          query:
            `CREATE TABLE IF NOT EXISTS "table" (` +
            `"id" bigserial NOT null, ` +
            `"default" bigint DEFAULT 123 NOT null, ` +
            `"nullable" bigint DEFAULT null` +
            `)`
        }
      ],
      indexes: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_id_pk'`,
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_id_pk" PRIMARY KEY ("id")`
        }
      ],
      constraints: [],
      relations: []
    });
  });

  it('assert :: create table (decimal columns)', async () => {
    const tables = getDatabaseTables({
      id: {
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

    const queries = getCreateQueries(tables);

    deepEqual(queries, {
      tables: [
        {
          query:
            `CREATE TABLE IF NOT EXISTS "table" (` +
            `"id" decimal NOT null, ` +
            `"default" decimal DEFAULT 1.23 NOT null, ` +
            `"nullable" decimal DEFAULT null` +
            `)`
        }
      ],
      indexes: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_id_pk'`,
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_id_pk" PRIMARY KEY ("id")`
        }
      ],
      constraints: [],
      relations: []
    });
  });

  it('assert :: create table (numeric columns)', async () => {
    const tables = getDatabaseTables({
      id: {
        type: SchemaType.Number
      },
      default: {
        type: SchemaType.Number,
        definitions: {
          default: 12.345
        }
      },
      nullable: {
        type: SchemaType.Number,
        optional: true,
        nullable: true
      }
    });

    const queries = getCreateQueries(tables);

    deepEqual(queries, {
      tables: [
        {
          query:
            `CREATE TABLE IF NOT EXISTS "table" (` +
            `"id" decimal NOT null, ` +
            `"default" decimal DEFAULT 12.345 NOT null, ` +
            `"nullable" decimal DEFAULT null` +
            `)`
        }
      ],
      indexes: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_id_pk'`,
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_id_pk" PRIMARY KEY ("id")`
        }
      ],
      constraints: [],
      relations: []
    });
  });

  it('assert :: create table (string columns)', async () => {
    const tables = getDatabaseTables({
      id: {
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

    const queries = getCreateQueries(tables);

    deepEqual(queries, {
      tables: [
        {
          query:
            `CREATE TABLE IF NOT EXISTS "table" (` +
            `"id" text NOT null, ` +
            `"default" text DEFAULT 'foo' NOT null, ` +
            `"nullable" text DEFAULT null, ` +
            `"limited" varchar(32) NOT null` +
            `)`
        }
      ],
      indexes: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_id_pk'`,
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_id_pk" PRIMARY KEY ("id")`
        }
      ],
      constraints: [],
      relations: []
    });
  });

  it('assert :: create table (datetime columns)', async () => {
    const tables = getDatabaseTables({
      id: {
        type: SchemaType.String,
        format: 'date-time'
      },
      default: {
        type: SchemaType.String,
        format: 'date-time',
        definitions: {
          default: '1991-04-23T00:00:00Z'
        }
      },
      nullable: {
        type: SchemaType.String,
        format: 'date-time',
        optional: true,
        nullable: true
      }
    });

    const queries = getCreateQueries(tables);

    deepEqual(queries, {
      tables: [
        {
          query:
            `CREATE TABLE IF NOT EXISTS "table" (` +
            `"id" timestamptz DEFAULT now() NOT null, ` +
            `"default" timestamptz DEFAULT '1991-04-23T00:00:00Z' NOT null, ` +
            `"nullable" timestamptz DEFAULT null` +
            `)`
        }
      ],
      indexes: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_id_pk'`,
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_id_pk" PRIMARY KEY ("id")`
        }
      ],
      constraints: [],
      relations: []
    });
  });

  it('assert :: create table (date columns)', async () => {
    const tables = getDatabaseTables({
      id: {
        type: SchemaType.String,
        format: 'date'
      },
      default: {
        type: SchemaType.String,
        format: 'date',
        definitions: {
          default: '1991-04-23'
        }
      },
      nullable: {
        type: SchemaType.String,
        format: 'date',
        optional: true,
        nullable: true
      }
    });

    const queries = getCreateQueries(tables);

    deepEqual(queries, {
      tables: [
        {
          query:
            `CREATE TABLE IF NOT EXISTS "table" (` +
            `"id" date DEFAULT now() NOT null, ` +
            `"default" date DEFAULT '1991-04-23' NOT null, ` +
            `"nullable" date DEFAULT null` +
            `)`
        }
      ],
      indexes: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_id_pk'`,
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_id_pk" PRIMARY KEY ("id")`
        }
      ],
      constraints: [],
      relations: []
    });
  });

  it('assert :: create table (time columns)', async () => {
    const tables = getDatabaseTables({
      id: {
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

    const queries = getCreateQueries(tables);

    deepEqual(queries, {
      tables: [
        {
          query:
            `CREATE TABLE IF NOT EXISTS "table" (` +
            `"id" time DEFAULT now() NOT null, ` +
            `"default" time DEFAULT '00:00:00' NOT null, ` +
            `"nullable" time DEFAULT null` +
            `)`
        }
      ],
      indexes: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_id_pk'`,
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_id_pk" PRIMARY KEY ("id")`
        }
      ],
      constraints: [],
      relations: []
    });
  });

  it('assert :: create table (uuid columns)', async () => {
    const tables = getDatabaseTables({
      id: {
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

    const queries = getCreateQueries(tables);

    deepEqual(queries, {
      tables: [
        {
          query:
            `CREATE TABLE IF NOT EXISTS "table" (` +
            `"id" uuid DEFAULT gen_random_uuid() NOT null, ` +
            `"default" uuid DEFAULT '00000000-0000-1000-9000-000000000000' NOT null, ` +
            `"nullable" uuid DEFAULT null` +
            `)`
        }
      ],
      indexes: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_id_pk'`,
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_id_pk" PRIMARY KEY ("id")`
        }
      ],
      constraints: [],
      relations: []
    });
  });

  it('assert :: create table (enum columns)', async () => {
    const tables = getDatabaseTables({
      id: {
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

    const queries = getCreateQueries(tables);

    deepEqual(queries, {
      tables: [
        {
          query:
            `CREATE TABLE IF NOT EXISTS "table" (` +
            `"id" text NOT null, ` +
            `"default_a" text DEFAULT 'foo' NOT null, ` +
            `"default_b" text DEFAULT '123' NOT null, ` +
            `"nullable" text DEFAULT null` +
            `)`
        }
      ],
      indexes: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_id_pk'`,
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_id_pk" PRIMARY KEY ("id")`
        }
      ],
      constraints: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_id_ck'`,
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_id_ck" CHECK (false)`
        },
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_default_a_ck'`,
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_default_a_ck" CHECK ("default_a" IN ('foo'))`
        },
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_default_b_ck'`,
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_default_b_ck" CHECK ("default_b" IN ('123'))`
        },
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_nullable_ck'`,
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_nullable_ck" CHECK (false)`
        }
      ],
      relations: []
    });
  });

  it('assert :: create table (object columns)', async () => {
    const tables = getDatabaseTables({
      id: {
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

    const queries = getCreateQueries(tables);

    deepEqual(queries, {
      tables: [
        {
          query:
            `CREATE TABLE IF NOT EXISTS "table" (` +
            `"id" jsonb NOT null, ` +
            `"default" jsonb DEFAULT '{"foo":true,"bar":"bar","baz":123}' NOT null, ` +
            `"nullable" jsonb DEFAULT null` +
            `)`
        }
      ],
      indexes: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_id_pk'`,
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_id_pk" PRIMARY KEY ("id")`
        }
      ],
      constraints: [],
      relations: []
    });
  });

  it('assert :: create table (array columns)', async () => {
    const tables = getDatabaseTables({
      id: {
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

    const queries = getCreateQueries(tables);

    deepEqual(queries, {
      tables: [
        {
          query:
            `CREATE TABLE IF NOT EXISTS "table" (` +
            `"id" jsonb NOT null, ` +
            `"default" jsonb DEFAULT '["foo","bar"]' NOT null, ` +
            `"nullable" jsonb DEFAULT null` +
            `)`
        }
      ],
      indexes: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_id_pk'`,
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_id_pk" PRIMARY KEY ("id")`
        }
      ],
      constraints: [],
      relations: []
    });
  });

  it('assert :: create table (tuple columns)', async () => {
    const tables = getDatabaseTables({
      id: {
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

    const queries = getCreateQueries(tables);

    deepEqual(queries, {
      tables: [
        {
          query:
            `CREATE TABLE IF NOT EXISTS "table" (` +
            `"id" jsonb NOT null, ` +
            `"default" jsonb DEFAULT '["foo",123]' NOT null, ` +
            `"nullable" jsonb DEFAULT null` +
            `)`
        }
      ],
      indexes: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_id_pk'`,
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_id_pk" PRIMARY KEY ("id")`
        }
      ],
      constraints: [],
      relations: []
    });
  });
});
