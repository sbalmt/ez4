import type { Query, RelationMetadata } from '@ez4/database';
import type { PostgresEngine } from '@ez4/pgclient/library';
import type { ObjectSchema } from '@ez4/schema';

import { describe, it } from 'node:test';

import { prepareSelectQuery } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';
import { SqlBuilder } from '@ez4/pgsql';
import { Order } from '@ez4/database';

type TestTableSchema = {
  foo: boolean;
  bar: number;
  baz: string;
  qux: {
    quxFoo: string;
    quxBar: boolean;
  };
};

type TestTableMetadata = {
  engine: PostgresEngine;
  relations: RelationMetadata;
  schema: TestTableSchema;
  indexes: {};
};

describe('select schema', () => {
  const prepareSelect = <S extends Query.SelectInput<TestTableMetadata>>(
    schema: ObjectSchema,
    query: Query.FindManyInput<S, false, TestTableMetadata>
  ) => {
    const builder = new SqlBuilder();

    return prepareSelectQuery('ez4-test-select-schema', schema, {}, query, builder);
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
          baz: {
            type: SchemaType.String,
            format: 'date'
          }
        }
      },
      {
        select: {
          baz: true
        }
      }
    );

    assert.equal(statement, `SELECT to_char("baz", 'YYYY-MM-DD') AS "baz" FROM "ez4-test-select-schema"`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare select schema (time field)', ({ assert }) => {
    const [statement, variables] = prepareSelect(
      {
        type: SchemaType.Object,
        properties: {
          baz: {
            type: SchemaType.String,
            format: 'time'
          }
        }
      },
      {
        select: {
          baz: true
        }
      }
    );

    assert.equal(statement, `SELECT to_char("baz", 'HH24:MI:SS.MS"Z"') AS "baz" FROM "ez4-test-select-schema"`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare select schema (datetime field)', ({ assert }) => {
    const [statement, variables] = prepareSelect(
      {
        type: SchemaType.Object,
        properties: {
          baz: {
            type: SchemaType.String,
            format: 'date-time'
          }
        }
      },
      {
        select: {
          baz: true
        }
      }
    );

    assert.equal(statement, `SELECT to_char("baz", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS "baz" FROM "ez4-test-select-schema"`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare select schema (json object)', ({ assert }) => {
    const [statement, variables] = prepareSelect(
      {
        type: SchemaType.Object,
        properties: {
          bar: {
            type: SchemaType.Number
          },
          qux: {
            type: SchemaType.Object,
            properties: {
              quxFoo: {
                type: SchemaType.String
              },
              quxBar: {
                type: SchemaType.Boolean
              }
            }
          }
        }
      },
      {
        select: {
          bar: true,
          qux: {
            quxBar: true
          }
        }
      }
    );

    assert.equal(statement, `SELECT "bar", json_build_object('quxBar', "qux"['quxBar']) AS "qux" FROM "ez4-test-select-schema"`);

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
        }
      }
    );

    assert.equal(statement, `SELECT "foo" FROM "ez4-test-select-schema" WHERE "bar" = :0`);

    assert.deepEqual(variables, [123]);
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
