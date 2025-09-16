import type { Query, RelationMetadata } from '@ez4/database';
import type { PostgresEngine } from '@ez4/pgclient/library';
import type { ObjectSchema } from '@ez4/schema';

import { describe, it } from 'node:test';

import { MalformedRequestError } from '@ez4/pgclient';
import { prepareInsertQuery } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';
import { SqlBuilder } from '@ez4/pgsql';

type TestTableMetadata = {
  engine: PostgresEngine;
  relations: RelationMetadata;
  indexes: {};
  schema: {};
};

describe('insert schema', () => {
  const prepareInsert = async <S extends Query.SelectInput<TestTableMetadata>>(
    schema: ObjectSchema,
    query: Query.InsertOneInput<S, TestTableMetadata>
  ) => {
    const builder = new SqlBuilder();

    const allQueries = await prepareInsertQuery(builder, 'ez4-test-insert-schema', schema, {}, query);

    return builder.with(allQueries).build();
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

    assert.deepEqual(variables, [true, false]);
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

    assert.deepEqual(variables, [123]);
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

    assert.deepEqual(variables, ['foo']);
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

    assert.equal(statement, `INSERT INTO "ez4-test-insert-schema" ("nullable") VALUES (null)`);

    assert.deepEqual(variables, []);
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

  it('assert :: prepare insert schema (scalar unexpected field)', async ({ assert }) => {
    const [statement, variables] = await prepareInsert(
      {
        type: SchemaType.Object,
        properties: {
          foo: {
            type: SchemaType.Number
          }
        }
      },
      {
        data: {
          foo: 123,
          bar: 'extra'
        }
      }
    );

    assert.equal(statement, `INSERT INTO "ez4-test-insert-schema" ("foo") VALUES (:0)`);

    assert.deepEqual(variables, [123]);
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

    assert.deepEqual(variables, [{ foo: true, bar: false }]);
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

    assert.deepEqual(variables, [{ number: 123 }]);
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

    assert.deepEqual(variables, [{ text: 'foo' }]);
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

    assert.deepEqual(variables, [{ nullable: null }]);
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

    assert.deepEqual(variables, [{}]);
  });

  it('assert :: prepare insert schema (json additional field)', async ({ assert }) => {
    const [statement, variables] = await prepareInsert(
      {
        type: SchemaType.Object,
        properties: {
          json: {
            type: SchemaType.Object,
            properties: {},
            additional: {
              property: {
                type: SchemaType.String
              },
              value: {
                type: SchemaType.Number
              }
            }
          }
        }
      },
      {
        data: {
          json: {
            foo: 123,
            bar: 456
          }
        }
      }
    );

    assert.equal(statement, `INSERT INTO "ez4-test-insert-schema" ("json") VALUES (:0)`);

    assert.deepEqual(variables, [{ foo: 123, bar: 456 }]);
  });

  it('assert :: prepare insert schema (json unknown field)', async ({ assert }) => {
    const [statement, variables] = await prepareInsert(
      {
        type: SchemaType.Object,
        properties: {
          json: {
            type: SchemaType.Object,
            properties: {},
            definitions: {
              extensible: true
            }
          }
        }
      },
      {
        data: {
          json: {
            foo: 123,
            bar: 'bar',
            baz: true
          }
        }
      }
    );

    assert.equal(statement, `INSERT INTO "ez4-test-insert-schema" ("json") VALUES (:0)`);

    assert.deepEqual(variables, [{ foo: 123, bar: 'bar', baz: true }]);
  });

  it('assert :: prepare insert schema (json unexpected field)', async ({ assert }) => {
    const [statement, variables] = await prepareInsert(
      {
        type: SchemaType.Object,
        properties: {
          json: {
            type: SchemaType.Object,
            properties: {
              foo: {
                type: SchemaType.Number
              }
            }
          }
        }
      },
      {
        data: {
          json: {
            foo: 123,
            bar: 'extra'
          }
        }
      }
    );

    assert.equal(statement, `INSERT INTO "ez4-test-insert-schema" ("json") VALUES (:0)`);

    assert.deepEqual(variables, [{ foo: 123 }]);
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
      `WITH "Q0" AS (INSERT INTO "ez4-test-insert-schema" ("scalar", "json") VALUES (:0, :1) RETURNING "scalar", "json") ` +
        `SELECT "scalar", json_build_object('scalar', "json"['scalar']) AS "json" FROM "Q0"`
    );

    assert.deepEqual(variables, ['foo', { scalar: 123 }]);
  });

  it('assert :: prepare insert schema (missing scalar field)', async ({ assert }) => {
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

  it('assert :: prepare insert schema (invalid scalar field type)', async ({ assert }) => {
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

  it('assert :: prepare insert schema (invalid json field type)', async ({ assert }) => {
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
