import type { Database, Query } from '@ez4/database';

import { describe, it } from 'node:test';

import { prepareSelectQuery } from '@ez4/aws-aurora/client';
import { ObjectSchema, SchemaType } from '@ez4/schema';
import { Order } from '@ez4/database';

import { makeParameter } from './common/parameters.js';

type TestRelations = {
  indexes: never;
  filters: {};
  selects: {};
  changes: {};
};

describe('aurora query (select schema)', () => {
  const prepareSelect = <T extends Database.Schema, S extends Query.SelectInput<T, TestRelations>>(
    schema: ObjectSchema,
    query: Query.FindManyInput<T, S, {}, TestRelations, false>
  ) => {
    return prepareSelectQuery<T, S, {}, TestRelations, false>('ez4-test-select-schema', schema, {}, query);
  };

  it('assert :: prepare select schema (all fields)', ({ assert }) => {
    const [statement, variables] = prepareSelect(
      {
        type: SchemaType.Object,
        properties: {
          foo: {
            type: SchemaType.Boolean
          },
          bar: {
            type: SchemaType.Number
          },
          baz: {
            type: SchemaType.String
          }
        }
      },
      {
        select: {
          // No field specified, select all
        }
      }
    );

    assert.equal(statement, `SELECT "foo", "bar", "baz" FROM "ez4-test-select-schema"`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare select schema (defined fields)', ({ assert }) => {
    const [statement, variables] = prepareSelect(
      {
        type: SchemaType.Object,
        properties: {
          foo: {
            type: SchemaType.Boolean
          },
          bar: {
            type: SchemaType.Number
          },
          baz: {
            type: SchemaType.String
          }
        }
      },
      {
        select: {
          foo: true,
          baz: true
        }
      }
    );

    assert.equal(statement, `SELECT "foo", "baz" FROM "ez4-test-select-schema"`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare select schema (date field)', ({ assert }) => {
    const [statement, variables] = prepareSelect(
      {
        type: SchemaType.Object,
        properties: {
          foo: {
            type: SchemaType.String,
            format: 'date'
          }
        }
      },
      {
        select: {
          foo: true
        }
      }
    );

    assert.equal(statement, `SELECT to_char("foo", 'YYYY-MM-DD') AS "foo" FROM "ez4-test-select-schema"`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare select schema (time field)', ({ assert }) => {
    const [statement, variables] = prepareSelect(
      {
        type: SchemaType.Object,
        properties: {
          foo: {
            type: SchemaType.String,
            format: 'time'
          }
        }
      },
      {
        select: {
          foo: true
        }
      }
    );

    assert.equal(statement, `SELECT to_char("foo", 'HH24:MI:SS.MS"Z"') AS "foo" FROM "ez4-test-select-schema"`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare select schema (datetime field)', ({ assert }) => {
    const [statement, variables] = prepareSelect(
      {
        type: SchemaType.Object,
        properties: {
          foo: {
            type: SchemaType.String,
            format: 'date-time'
          }
        }
      },
      {
        select: {
          foo: true
        }
      }
    );

    assert.equal(statement, `SELECT to_char("foo", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS "foo" FROM "ez4-test-select-schema"`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare select schema (json object)', ({ assert }) => {
    const [statement, variables] = prepareSelect(
      {
        type: SchemaType.Object,
        properties: {
          foo: {
            type: SchemaType.Number
          },
          bar: {
            type: SchemaType.Object,
            properties: {
              barFoo: {
                type: SchemaType.String
              },
              barBar: {
                type: SchemaType.Boolean
              }
            }
          }
        }
      },
      {
        select: {
          foo: true,
          bar: {
            barBar: true
          }
        }
      }
    );

    assert.equal(statement, `SELECT "foo", json_build_object('barBar', "bar"['barBar']) AS "bar" FROM "ez4-test-select-schema"`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare select schema (with filters)', ({ assert }) => {
    const [statement, variables] = prepareSelect(
      {
        type: SchemaType.Object,
        properties: {
          foo: {
            type: SchemaType.Boolean
          },
          bar: {
            type: SchemaType.Number
          }
        }
      },
      {
        select: {
          foo: true
        },
        where: {
          bar: 123
        } as any
      }
    );

    assert.equal(statement, `SELECT "foo" FROM "ez4-test-select-schema" WHERE "bar" = :0`);

    assert.deepEqual(variables, [makeParameter('0', 123)]);
  });

  it('assert :: prepare select schema (with order)', ({ assert }) => {
    const [statement, variables] = prepareSelect(
      {
        type: SchemaType.Object,
        properties: {
          foo: {
            type: SchemaType.Boolean
          }
        }
      },
      {
        select: {
          foo: true
        },
        order: {
          foo: Order.Desc
        }
      }
    );

    assert.equal(statement, `SELECT "foo" FROM "ez4-test-select-schema" ORDER BY "foo" DESC`);

    assert.deepEqual(variables, []);
  });
});
