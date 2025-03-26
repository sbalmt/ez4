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

describe.only('aurora query (insert operations)', () => {
  const prepareInsert = <T extends Database.Schema, S extends Query.SelectInput<T, TestRelations>>(
    schema: ObjectSchema,
    data: Query.InsertOneInput<T, S, TestRelations>['data']
  ) => {
    return prepareInsertQuery<T, S, TestRelations>(
      'ez4-test-insert-schema',
      schema,
      {},
      {
        data
      }
    );
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
        foo: true,
        bar: false
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
        number: 123
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
        text: 'foo'
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
        nullable: null
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
        optional: undefined
      }
    );

    assert.equal(statement, `INSERT INTO "ez4-test-insert-schema" DEFAULT VALUES`);

    assert.deepEqual(variables, []);
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
            // The `column` can't be string as per schema definition.
            column: 'foo'
          }
        ),
      MalformedRequestError
    );
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
        json: {
          foo: true,
          bar: false
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
        json: {
          number: 123
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
        json: {
          text: 'foo'
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
        json: {
          nullable: null
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
        json: {
          optional: undefined
        }
      }
    );

    assert.equal(statement, `INSERT INTO "ez4-test-insert-schema" ("json") VALUES (:0)`);

    assert.deepEqual(variables, [makeParameter('0', { optional: undefined })]);
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
            json: {
              // The `column` can't be numeric as per schema definition.
              column: 123
            }
          }
        ),
      MalformedRequestError
    );
  });
});
