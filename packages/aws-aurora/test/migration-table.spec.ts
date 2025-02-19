import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { prepareCreateTable, prepareDeleteTable } from '@ez4/aws-aurora';
import { SchemaType } from '@ez4/schema';

describe.only('aurora migration (table)', () => {
  it('assert :: create table (boolean)', () => {
    const statement = prepareCreateTable(
      'ez4-test-table',
      {
        type: SchemaType.Object,
        properties: {
          default: {
            type: SchemaType.Boolean,
            definitions: {
              default: true
            }
          },
          optional: {
            type: SchemaType.Boolean,
            optional: true
          }
        }
      },
      {}
    );

    equal(
      statement,
      `CREATE TABLE "ez4-test-table" (` +
        `"default" boolean NOT null DEFAULT true, ` +
        `"optional" boolean DEFAULT null` +
        `)`
    );
  });

  it('assert :: create table (number)', () => {
    const statement = prepareCreateTable(
      'ez4-test-table',
      {
        type: SchemaType.Object,
        properties: {
          default: {
            type: SchemaType.Number,
            definitions: {
              default: 1.23
            }
          },
          optional: {
            type: SchemaType.Number,
            optional: true
          },
          integer: {
            type: SchemaType.Number,
            format: 'integer'
          },
          decimal: {
            type: SchemaType.Number,
            format: 'decimal'
          }
        }
      },
      {}
    );

    equal(
      statement,
      `CREATE TABLE "ez4-test-table" (` +
        `"default" decimal NOT null DEFAULT 1.23, ` +
        `"optional" decimal DEFAULT null, ` +
        `"integer" bigint NOT null, ` +
        `"decimal" decimal NOT null` +
        `)`
    );
  });

  it('assert :: create table (string)', () => {
    const statement = prepareCreateTable(
      'ez4-test-table',
      {
        type: SchemaType.Object,
        properties: {
          default: {
            type: SchemaType.String,
            definitions: {
              default: 'foo'
            }
          },
          optional: {
            type: SchemaType.String,
            optional: true
          },
          limited: {
            type: SchemaType.String,
            definitions: {
              maxLength: 32
            }
          },
          datetime: {
            type: SchemaType.String,
            format: 'date-time'
          },
          date: {
            type: SchemaType.String,
            format: 'date'
          },
          time: {
            type: SchemaType.String,
            format: 'time'
          },
          uuid: {
            type: SchemaType.String,
            format: 'uuid'
          }
        }
      },
      {}
    );

    equal(
      statement,
      `CREATE TABLE "ez4-test-table" (` +
        `"default" text NOT null DEFAULT 'foo', ` +
        `"optional" text DEFAULT null, ` +
        `"limited" varchar(32) NOT null, ` +
        `"datetime" timestamptz NOT null, ` +
        `"date" date NOT null, ` +
        `"time" time NOT null, ` +
        `"uuid" uuid NOT null` +
        `)`
    );
  });

  it('assert :: create table (enum)', () => {
    const statement = prepareCreateTable(
      'ez4-test-table',
      {
        type: SchemaType.Object,
        properties: {
          default: {
            type: SchemaType.Enum,
            definitions: {
              default: 'foo'
            },
            options: [
              {
                value: 123
              },
              {
                value: 'foo'
              }
            ]
          },
          optional: {
            type: SchemaType.Enum,
            optional: true,
            options: [
              {
                value: 123
              },
              {
                value: 'foo'
              }
            ]
          }
        }
      },
      {}
    );

    equal(
      statement,
      `CREATE TABLE "ez4-test-table" (` +
        `"default" text NOT null DEFAULT 'foo', ` +
        `"optional" text DEFAULT null` +
        `)`
    );
  });

  it('assert :: create table (jsonb)', () => {
    const statement = prepareCreateTable(
      'ez4-test-table',
      {
        type: SchemaType.Object,
        properties: {
          object: {
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
          tuple: {
            type: SchemaType.Tuple,
            elements: [
              {
                type: SchemaType.String
              }
            ]
          },
          array: {
            type: SchemaType.Array,
            element: {
              type: SchemaType.String
            }
          }
        }
      },
      {}
    );

    equal(
      statement,
      `CREATE TABLE "ez4-test-table" (` +
        `"object" jsonb NOT null DEFAULT '{"foo":true,"bar":"bar","baz":123}', ` +
        `"tuple" jsonb NOT null, ` +
        `"array" jsonb NOT null` +
        `)`
    );
  });

  it('assert :: delete table', () => {
    const statement = prepareDeleteTable('ez4-test-table');

    equal(statement, `DROP TABLE IF EXISTS "ez4-test-table" CASCADE`);
  });
});
