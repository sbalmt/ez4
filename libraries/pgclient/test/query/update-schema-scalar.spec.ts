import type { Query, RelationMetadata } from '@ez4/database';
import type { PostgresEngine } from '@ez4/pgclient/library';
import type { ObjectSchema } from '@ez4/schema';

import { describe, it } from 'node:test';

import { MalformedRequestError } from '@ez4/pgclient';
import { prepareUpdateQuery } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';
import { SqlBuilder } from '@ez4/pgsql';

type TestTableMetadata = {
  engine: PostgresEngine;
  relations: RelationMetadata;
  indexes: {};
  schema: {};
};

describe('update scalar schema', () => {
  const prepareUpdate = async <S extends Query.SelectInput<TestTableMetadata>>(
    schema: ObjectSchema,
    query: Query.UpdateManyInput<S, TestTableMetadata>
  ) => {
    const builder = new SqlBuilder();

    const allQueries = await prepareUpdateQuery(builder, 'ez4-test-update-schema', schema, {}, query);

    return builder.with(allQueries).build();
  };

  it('assert :: prepare update schema (scalar boolean)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate(
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

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-schema" SET "foo" = :0, "bar" = :1`);

    assert.deepEqual(variables, [true, false]);
  });

  it('assert :: prepare update schema (scalar number)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate(
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

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-schema" SET "number" = :0`);

    assert.deepEqual(variables, [123]);
  });

  it('assert :: prepare update schema (scalar string)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate(
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

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-schema" SET "text" = :0`);

    assert.deepEqual(variables, ['foo']);
  });

  it('assert :: prepare update schema (scalar nullable)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate(
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

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-schema" SET "nullable" = null`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare update schema (scalar optional)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate(
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

    assert.equal(statement, `SELECT * FROM "ez4-test-update-schema"`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare update schema (scalar optional and required)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate(
      {
        type: SchemaType.Object,
        properties: {
          required: {
            type: SchemaType.Number
          },
          optional: {
            type: SchemaType.String,
            optional: true
          }
        }
      },
      {
        data: {
          required: undefined,
          optional: undefined
        }
      }
    );

    assert.equal(statement, `SELECT * FROM "ez4-test-update-schema"`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare update schema (scalar unexpected field)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate(
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

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-schema" SET "foo" = :0`);

    assert.deepEqual(variables, [123]);
  });

  it('assert :: prepare update schema (invalid scalar field type)', async ({ assert }) => {
    await assert.rejects(
      () =>
        prepareUpdate(
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
});
