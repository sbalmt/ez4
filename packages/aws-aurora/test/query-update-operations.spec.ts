import type { ObjectSchema } from '@ez4/schema';
import type { Query } from '@ez4/database';

import { describe, it } from 'node:test';

import { prepareUpdateQuery } from '@ez4/aws-aurora/client';
import { SchemaType } from '@ez4/schema';

import { makeParameter } from './common/parameters.js';

type TestSchema = {
  scalar?: number;
  json: {
    foo?: number;
  };
};

type TestRelations = {
  indexes: never;
  filters: {};
  selects: {};
  changes: {};
};

describe.only('aurora query (update operations)', () => {
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

  const prepareUpdate = <S extends Query.SelectInput<TestSchema, TestRelations>>(
    data: Query.UpdateManyInput<TestSchema, S, TestRelations>['data']
  ) => {
    return prepareUpdateQuery<TestSchema, S, {}, TestRelations>(
      'ez4-test-update-operation',
      testSchema,
      {},
      {
        data
      }
    );
  };

  it('assert :: prepare update operations (scalar increment)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      scalar: {
        increment: 123
      }
    });

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-operation" SET "scalar" = ("scalar" + :0)`);

    assert.deepEqual(variables, [makeParameter('0', 123)]);
  });

  it('assert :: prepare update operations (scalar decrement)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      scalar: {
        decrement: 123
      }
    });

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-operation" SET "scalar" = ("scalar" - :0)`);

    assert.deepEqual(variables, [makeParameter('0', 123)]);
  });

  it('assert :: prepare update operations (scalar multiplication)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      scalar: {
        multiply: 123
      }
    });

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-operation" SET "scalar" = ("scalar" * :0)`);

    assert.deepEqual(variables, [makeParameter('0', 123)]);
  });

  it('assert :: prepare update operations (scalar division)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      scalar: {
        divide: 123
      }
    });

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-operation" SET "scalar" = ("scalar" / :0)`);

    assert.deepEqual(variables, [makeParameter('0', 123)]);
  });

  it('assert :: prepare update operations (json increment)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      json: {
        foo: {
          increment: 456
        }
      }
    });

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-operation" SET "json"['foo'] = ("json"['foo']::int + :0::int)::text::jsonb`);

    assert.deepEqual(variables, [makeParameter('0', JSON.stringify(456), 'JSON')]);
  });

  it('assert :: prepare update operations (json decrement)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      json: {
        foo: {
          decrement: 456
        }
      }
    });

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-operation" SET "json"['foo'] = ("json"['foo']::int - :0::int)::text::jsonb`);

    assert.deepEqual(variables, [makeParameter('0', JSON.stringify(456), 'JSON')]);
  });

  it('assert :: prepare update operations (json multiplication)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      json: {
        foo: {
          multiply: 456
        }
      }
    });

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-operation" SET "json"['foo'] = ("json"['foo']::int * :0::int)::text::jsonb`);

    assert.deepEqual(variables, [makeParameter('0', JSON.stringify(456), 'JSON')]);
  });

  it('assert :: prepare update operations (json division)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      json: {
        foo: {
          divide: 456
        }
      }
    });

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-operation" SET "json"['foo'] = ("json"['foo']::int / :0::int)::text::jsonb`);

    assert.deepEqual(variables, [makeParameter('0', JSON.stringify(456), 'JSON')]);
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
