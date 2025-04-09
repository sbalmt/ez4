import type { Database, Query } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';

import { describe, it } from 'node:test';

import { MalformedRequestError, prepareInsertQuery } from '@ez4/aws-aurora/client';
import { SchemaType } from '@ez4/schema';

import { makeParameter } from './common/parameters.js';

type TestRelations = {
  indexes: never;
  filters: {};
  selects: {};
  changes: {};
};

describe('aurora query (insert operations)', () => {
  const prepareInsert = <T extends Database.Schema, S extends Query.SelectInput<T, TestRelations>>(
    schema: ObjectSchema,
    query: Query.InsertOneInput<T, S, TestRelations>
  ) => {
    return prepareInsertQuery<T, S, TestRelations>('ez4-test-insert-schema', schema, {}, query);
  };

  it('assert :: prepare insert schema (scalar boolean)', async ({ assert }) => {
    const [statement, variables] = await prepareInsert(
      {
        type: SchemaType.Object,
        properties: {
          foo: {
            type: SchemaType.Boolean
          },
          bar: {
            type: SchemaType.Boolean
          }
        }
      },
      {
        data: {
          foo: true,
          bar: false
        }
      }
    );

    assert.equal(statement, `INSERT INTO "ez4-test-insert-schema" ("foo", "bar") VALUES (:0, :1)`);

    assert.deepEqual(variables, [makeParameter('0', true), makeParameter('1', false)]);
  });

  it('assert :: prepare insert schema (scalar number)', async ({ assert }) => {
    const [statement, variables] = await prepareInsert(
      {
        type: SchemaType.Object,
        properties: {
          number: {
            type: SchemaType.Number
          }
        }
      },
      {
        data: {
          number: 123
        }
      }
    );

    assert.equal(statement, `INSERT INTO "ez4-test-insert-schema" ("number") VALUES (:0)`);

    assert.deepEqual(variables, [makeParameter('0', 123)]);
  });

  it('assert :: prepare insert schema (scalar string)', async ({ assert }) => {
    const [statement, variables] = await prepareInsert(
      {
        type: SchemaType.Object,
        properties: {
          text: {
            type: SchemaType.String
          }
        }
      },
      {
        data: {
          text: 'foo'
        }
      }
    );

    assert.equal(statement, `INSERT INTO "ez4-test-insert-schema" ("text") VALUES (:0)`);

    assert.deepEqual(variables, [makeParameter('0', 'foo')]);
  });

  it('assert :: prepare insert schema (scalar nullable)', async ({ assert }) => {
    const [statement, variables] = await prepareInsert(
      {
        type: SchemaType.Object,
        properties: {
          nullable: {
            type: SchemaType.String,
            nullable: true
          }
        }
      },
      {
        data: {
          nullable: null
        }
      }
    );

    assert.equal(statement, `INSERT INTO "ez4-test-insert-schema" ("nullable") VALUES (:0)`);

    assert.deepEqual(variables, [makeParameter('0', null)]);
  });

  it('assert :: prepare insert schema (scalar optional)', async ({ assert }) => {
    const [statement, variables] = await prepareInsert(
      {
        type: SchemaType.Object,
        properties: {
          optional: {
            type: SchemaType.String,
            optional: true
          }
        }
      },
      {
        data: {
          optional: undefined
        }
      }
    );

    assert.equal(statement, `INSERT INTO "ez4-test-insert-schema" DEFAULT VALUES`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare insert schema (json boolean)', async ({ assert }) => {
    const [statement, variables] = await prepareInsert(
      {
        type: SchemaType.Object,
        properties: {
          json: {
            type: SchemaType.Object,
            properties: {
              foo: {
                type: SchemaType.Boolean
              },
              bar: {
                type: SchemaType.Boolean
              }
            }
          }
        }
      },
      {
        data: {
          json: {
            foo: true,
            bar: false
          }
        }
      }
    );

    assert.equal(statement, `INSERT INTO "ez4-test-insert-schema" ("json") VALUES (:0)`);

    assert.deepEqual(variables, [makeParameter('0', { foo: true, bar: false })]);
  });

  it('assert :: prepare insert schema (json number)', async ({ assert }) => {
    const [statement, variables] = await prepareInsert(
      {
        type: SchemaType.Object,
        properties: {
          json: {
            type: SchemaType.Object,
            properties: {
              number: {
                type: SchemaType.Number
              }
            }
          }
        }
      },
      {
        data: {
          json: {
            number: 123
          }
        }
      }
    );

    assert.equal(statement, `INSERT INTO "ez4-test-insert-schema" ("json") VALUES (:0)`);

    assert.deepEqual(variables, [makeParameter('0', { number: 123 })]);
  });

  it('assert :: prepare insert schema (json string)', async ({ assert }) => {
    const [statement, variables] = await prepareInsert(
      {
        type: SchemaType.Object,
        properties: {
          json: {
            type: SchemaType.Object,
            properties: {
              text: {
                type: SchemaType.String
              }
            }
          }
        }
      },
      {
        data: {
          json: {
            text: 'foo'
          }
        }
      }
    );

    assert.equal(statement, `INSERT INTO "ez4-test-insert-schema" ("json") VALUES (:0)`);

    assert.deepEqual(variables, [makeParameter('0', { text: 'foo' })]);
  });

  it('assert :: prepare insert schema (json nullable)', async ({ assert }) => {
    const [statement, variables] = await prepareInsert(
      {
        type: SchemaType.Object,
        properties: {
          json: {
            type: SchemaType.Object,
            properties: {
              nullable: {
                type: SchemaType.Number,
                nullable: true
              }
            }
          }
        }
      },
      {
        data: {
          json: {
            nullable: null
          }
        }
      }
    );

    assert.equal(statement, `INSERT INTO "ez4-test-insert-schema" ("json") VALUES (:0)`);

    assert.deepEqual(variables, [makeParameter('0', { nullable: null })]);
  });

  it('assert :: prepare insert schema (json optional)', async ({ assert }) => {
    const [statement, variables] = await prepareInsert(
      {
        type: SchemaType.Object,
        properties: {
          json: {
            type: SchemaType.Object,
            properties: {
              optional: {
                type: SchemaType.Number,
                optional: true
              }
            }
          }
        }
      },
      {
        data: {
          json: {
            optional: undefined
          }
        }
      }
    );

    assert.equal(statement, `INSERT INTO "ez4-test-insert-schema" ("json") VALUES (:0)`);

    assert.deepEqual(variables, [makeParameter('0', { optional: undefined })]);
  });

  it('assert :: prepare insert schema (with select)', async ({ assert }) => {
    const [statement, variables] = await prepareInsert(
      {
        type: SchemaType.Object,
        properties: {
          scalar: {
            type: SchemaType.String,
            optional: true
          },
          json: {
            type: SchemaType.Object,
            properties: {
              scalar: {
                type: SchemaType.Number
              }
            }
          }
        }
      },
      {
        select: {
          scalar: true,
          json: {
            scalar: true
          }
        },
        data: {
          scalar: 'foo',
          json: {
            scalar: 123
          }
        }
      }
    );

    assert.equal(
      statement,
      `WITH "R0" AS (INSERT INTO "ez4-test-insert-schema" ("scalar", "json") VALUES (:0, :1) RETURNING "scalar", "json") ` +
        `SELECT "scalar", json_build_object('scalar', "json"['scalar']) AS "json" FROM "R0"`
    );

    assert.deepEqual(variables, [makeParameter('0', 'foo'), makeParameter('1', { scalar: 123 })]);
  });

  it('assert :: prepare insert schema (scalar invalid type)', async ({ assert }) => {
    await assert.rejects(
      () =>
        prepareInsert(
          {
            type: SchemaType.Object,
            properties: {
              column: {
                type: SchemaType.Number
              }
            }
          },
          {
            data: {
              // The `column` can't be string as per schema definition.
              column: 'foo'
            }
          }
        ),
      MalformedRequestError
    );
  });

  it('assert :: prepare insert schema (scalar missing field)', async ({ assert }) => {
    await assert.rejects(
      () =>
        prepareInsert(
          {
            type: SchemaType.Object,
            properties: {
              foo: {
                type: SchemaType.Boolean
              }
            }
          },
          {
            data: {
              // None of the required fields were given.
            }
          }
        ),
      MalformedRequestError
    );
  });

  it('assert :: prepare insert schema (json invalid type)', async ({ assert }) => {
    await assert.rejects(
      () =>
        prepareInsert(
          {
            type: SchemaType.Object,
            properties: {
              json: {
                type: SchemaType.Object,
                properties: {
                  column: {
                    type: SchemaType.String
                  }
                }
              }
            }
          },
          {
            data: {
              json: {
                // The `column` can't be numeric as per schema definition.
                column: 123
              }
            }
          }
        ),
      MalformedRequestError
    );
  });
});
