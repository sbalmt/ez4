import type { IndexedTables, RelationTables } from '@ez4/database/library';
import type { Database, Query } from '@ez4/database';
import type { PostgresEngine } from '@ez4/pgclient';

import { describe, it } from 'node:test';

import { SchemaType } from '@ez4/schema';
import { SqlBuilder } from '@ez4/pgsql';
import { Index } from '@ez4/database';

import { prepareUpdateQuery } from '../../src/queries/update';
import { getRelationsWithSchema } from '../../src/service/relations';
import { getTableRepository } from '../../src/utils/repository';

declare class Test extends Database.Service<PostgresEngine> {
  tables: [
    {
      name: 'ez4-test-update-operation';
      relations: {};
      indexes: {
        id: Index.Primary;
      };
      schema: {
        id: string;
        scalar?: number;
        json: {
          foo?: number;
          bar?: string;
        };
      };
    }
  ];
}

type TestTableMetadata = {
  schema: Test['tables'][0]['schema'];
  indexes: IndexedTables<Test>['ez4-test-update-operation'];
  relations: RelationTables<Test>['ez4-test-update-operation'];
  engine: Test['engine'];
};

describe('update operations', () => {
  const tableName = 'ez4-test-update-operation';

  const repository = getTableRepository([
    {
      name: tableName,
      indexes: [],
      relations: [],
      schema: {
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
              },
              bar: {
                type: SchemaType.String,
                optional: true
              }
            }
          }
        }
      }
    }
  ]);

  const prepareUpdate = async <S extends Query.SelectInput<TestTableMetadata>>(
    data: Query.UpdateManyInput<S, TestTableMetadata>['data']
  ) => {
    const builder = new SqlBuilder();

    const table = repository[tableName];

    const relations = getRelationsWithSchema(tableName, repository);

    const { queries } = await prepareUpdateQuery(builder, tableName, table.schema, relations, { data });

    return builder.with(queries).build();
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

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-operation" SET "json"['foo'] = (("json"->>'foo')::dec + (:0)::dec)::text::jsonb`);

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

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-operation" SET "json"['foo'] = (("json"->>'foo')::dec - (:0)::dec)::text::jsonb`);

    assert.deepEqual(variables, [456]);
  });

  it('assert :: prepare update operations (json multiply)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      json: {
        foo: {
          multiply: 456
        }
      }
    });

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-operation" SET "json"['foo'] = (("json"->>'foo')::dec * (:0)::dec)::text::jsonb`);

    assert.deepEqual(variables, [456]);
  });

  it('assert :: prepare update operations (json divide)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      json: {
        foo: {
          divide: 456
        }
      }
    });

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-operation" SET "json"['foo'] = (("json"->>'foo')::dec / (:0)::dec)::text::jsonb`);

    assert.deepEqual(variables, [456]);
  });

  it('assert :: prepare update operations (json replace with)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      json: {
        replaceWith: {
          foo: 789
        }
      }
    });

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-operation" SET "json" = :0`);

    assert.deepEqual(variables, [
      {
        foo: 789
      }
    ]);
  });

  it('assert :: prepare update operations (json remove from)', async ({ assert }) => {
    const [statement] = await prepareUpdate({
      json: {
        bar: {
          removeFrom: true
        }
      }
    });

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-operation" SET "json" = "json" #- '{bar}'`);
  });

  it('assert :: prepare update operations (json update and remove from)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      json: {
        foo: 123,
        bar: {
          removeFrom: true
        }
      }
    });

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-operation" SET "json" = "json" #- '{bar}', "json"['foo'] = :0`);

    assert.deepEqual(variables, [123]);
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

  it('assert :: prepare update operations (invalid scalar multiplication operand)', async ({ assert }) => {
    await assert.rejects(() =>
      prepareUpdate({
        scalar: {
          multiply: '123' as any
        }
      })
    );
  });

  it('assert :: prepare update operations (invalid json multiplication operand)', async ({ assert }) => {
    await assert.rejects(() =>
      prepareUpdate({
        json: {
          foo: {
            multiply: '123' as any
          }
        }
      })
    );
  });
});
