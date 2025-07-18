import type { Query, RelationMetadata } from '@ez4/database';
import type { PostgresEngine } from '@ez4/pgclient/library';
import type { ObjectSchema } from '@ez4/schema';

import { describe, it } from 'node:test';

import { prepareUpdateQuery } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';
import { SqlBuilder } from '@ez4/pgsql';

type TestTableMetadata = {
  engine: PostgresEngine;
  relations: RelationMetadata;
  indexes: {};
  schema: {
    scalar?: number;
    json: {
      foo?: number;
    };
  };
};

describe('update operations', () => {
  const testSchema: ObjectSchema = {
    type: SchemaType.Object,
    properties: {
      id: {
        type: SchemaType.String,
        format: 'uuid'
      },
      scalar: {
        type: SchemaType.Number,
        optional: true
      },
      json: {
        type: SchemaType.Object,
        properties: {
          foo: {
            type: SchemaType.Number,
            optional: true
          }
        }
      }
    }
  };

  const prepareUpdate = <S extends Query.SelectInput<TestTableMetadata>>(data: Query.UpdateManyInput<S, TestTableMetadata>['data']) => {
    const builder = new SqlBuilder();

    return prepareUpdateQuery('ez4-test-update-operation', testSchema, {}, { data }, builder);
  };

  it('assert :: prepare update operations (scalar increment)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      scalar: {
        increment: 123
      }
    });

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-operation" SET "scalar" = ("scalar" + :0)`);

    assert.deepEqual(variables, [123]);
  });

  it('assert :: prepare update operations (scalar decrement)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      scalar: {
        decrement: 123
      }
    });

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-operation" SET "scalar" = ("scalar" - :0)`);

    assert.deepEqual(variables, [123]);
  });

  it('assert :: prepare update operations (scalar multiplication)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      scalar: {
        multiply: 123
      }
    });

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-operation" SET "scalar" = ("scalar" * :0)`);

    assert.deepEqual(variables, [123]);
  });

  it('assert :: prepare update operations (scalar division)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      scalar: {
        divide: 123
      }
    });

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-operation" SET "scalar" = ("scalar" / :0)`);

    assert.deepEqual(variables, [123]);
  });

  it('assert :: prepare update operations (json increment)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      json: {
        foo: {
          increment: 456
        }
      }
    });

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-operation" SET "json"['foo'] = ("json"->>'foo'::int + :0::int)::text::jsonb`);

    assert.deepEqual(variables, [456]);
  });

  it('assert :: prepare update operations (json decrement)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      json: {
        foo: {
          decrement: 456
        }
      }
    });

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-operation" SET "json"['foo'] = ("json"->>'foo'::int - :0::int)::text::jsonb`);

    assert.deepEqual(variables, [456]);
  });

  it('assert :: prepare update operations (json multiplication)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      json: {
        foo: {
          multiply: 456
        }
      }
    });

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-operation" SET "json"['foo'] = ("json"->>'foo'::int * :0::int)::text::jsonb`);

    assert.deepEqual(variables, [456]);
  });

  it('assert :: prepare update operations (json division)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      json: {
        foo: {
          divide: 456
        }
      }
    });

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-operation" SET "json"['foo'] = ("json"->>'foo'::int / :0::int)::text::jsonb`);

    assert.deepEqual(variables, [456]);
  });

  it('assert :: prepare update operations (invalid operator)', async ({ assert }) => {
    await assert.rejects(() =>
      prepareUpdate({
        scalar: {
          // The `wrong` column isn't a valid atomic operation.
          wrong: 123
        } as any
      })
    );
  });

  it('assert :: prepare update operations (invalid operand)', async ({ assert }) => {
    await assert.rejects(() =>
      prepareUpdate({
        json: {
          foo: {
            // The given `123` value isn't a number type.
            decrement: '123' as any
          }
        }
      })
    );
  });
});
