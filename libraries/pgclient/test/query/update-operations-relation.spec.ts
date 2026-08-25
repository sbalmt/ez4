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
    },
    {
      name: 'ez4-test-update-relation';
      indexes: {
        id: Index.Primary;
        operation_id: Index.Secondary;
      };
      relations: {
        'operation_id@operation': 'ez4-test-update-operation:id';
      };
      schema: {
        id: string;
        operation_id: string;
      };
    }
  ];
}

type TestTableMetadata = {
  schema: Test['tables'][1]['schema'];
  indexes: IndexedTables<Test>['ez4-test-update-relation'];
  relations: RelationTables<Test>['ez4-test-update-relation'];
  engine: Test['engine'];
};

describe('update operations relation', () => {
  const repository = getTableRepository([
    {
      name: 'ez4-test-update-operation',
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
    },
    {
      name: 'ez4-test-update-relation',
      indexes: [],
      relations: [
        {
          targetAlias: 'operation',
          targetColumn: 'operation_id',
          targetIndex: Index.Secondary,
          sourceIndex: Index.Primary,
          sourceTable: 'ez4-test-update-operation',
          sourceColumn: 'id'
        }
      ],
      schema: {
        type: SchemaType.Object,
        properties: {
          id: {
            type: SchemaType.String,
            format: 'uuid'
          },
          operation_id: {
            type: SchemaType.String,
            format: 'uuid'
          }
        }
      }
    }
  ]);

  const prepareUpdate = async <S extends Query.SelectInput<TestTableMetadata>>(
    data: Query.UpdateManyInput<S, TestTableMetadata>['data']
  ) => {
    const builder = new SqlBuilder();

    const name = 'ez4-test-update-relation';
    const table = repository[name];

    const relations = getRelationsWithSchema(name, repository);

    const { queries } = await prepareUpdateQuery(builder, name, table.schema, relations, { data });

    return builder.with(queries).build();
  };

  it('assert :: prepare update operations (scalar increment)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      operation: {
        scalar: {
          increment: 123
        }
      }
    });

    assert.equal(
      statement,
      `WITH "Q0" AS (SELECT "operation_id" FROM "ez4-test-update-relation") ` +
        `UPDATE ONLY "ez4-test-update-operation" AS "T" SET "scalar" = ("T"."scalar" + :0) FROM "Q0" ` +
        `WHERE "T"."id" = "Q0"."operation_id"`
    );

    assert.deepEqual(variables, [123]);
  });

  it('assert :: prepare update operations (scalar decrement)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      operation: {
        scalar: {
          decrement: 123
        }
      }
    });

    assert.equal(
      statement,
      `WITH "Q0" AS (SELECT "operation_id" FROM "ez4-test-update-relation") ` +
        `UPDATE ONLY "ez4-test-update-operation" AS "T" SET "scalar" = ("T"."scalar" - :0) FROM "Q0" ` +
        `WHERE "T"."id" = "Q0"."operation_id"`
    );

    assert.deepEqual(variables, [123]);
  });

  it('assert :: prepare update operations (scalar multiplication)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      operation: {
        scalar: {
          multiply: 123
        }
      }
    });

    assert.equal(
      statement,
      `WITH "Q0" AS (SELECT "operation_id" FROM "ez4-test-update-relation") ` +
        `UPDATE ONLY "ez4-test-update-operation" AS "T" SET "scalar" = ("T"."scalar" * :0) FROM "Q0" ` +
        `WHERE "T"."id" = "Q0"."operation_id"`
    );

    assert.deepEqual(variables, [123]);
  });

  it('assert :: prepare update operations (scalar division)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      operation: {
        scalar: {
          divide: 123
        }
      }
    });

    assert.equal(
      statement,
      `WITH "Q0" AS (SELECT "operation_id" FROM "ez4-test-update-relation") ` +
        `UPDATE ONLY "ez4-test-update-operation" AS "T" SET "scalar" = ("T"."scalar" / :0) FROM "Q0" ` +
        `WHERE "T"."id" = "Q0"."operation_id"`
    );

    assert.deepEqual(variables, [123]);
  });

  it('assert :: prepare update operations (json increment)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      operation: {
        json: {
          foo: {
            increment: 456
          }
        }
      }
    });

    assert.equal(
      statement,
      `WITH "Q0" AS (SELECT "operation_id" FROM "ez4-test-update-relation") ` +
        `UPDATE ONLY "ez4-test-update-operation" AS "T" SET "json"['foo'] = (("T"."json"->>'foo')::dec + (:0)::dec)::text::jsonb FROM "Q0" ` +
        `WHERE "T"."id" = "Q0"."operation_id"`
    );

    assert.deepEqual(variables, [456]);
  });

  it('assert :: prepare update operations (json decrement)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      operation: {
        json: {
          foo: {
            decrement: 456
          }
        }
      }
    });

    assert.equal(
      statement,
      `WITH "Q0" AS (SELECT "operation_id" FROM "ez4-test-update-relation") ` +
        `UPDATE ONLY "ez4-test-update-operation" AS "T" SET "json"['foo'] = (("T"."json"->>'foo')::dec - (:0)::dec)::text::jsonb FROM "Q0" ` +
        `WHERE "T"."id" = "Q0"."operation_id"`
    );

    assert.deepEqual(variables, [456]);
  });

  it('assert :: prepare update operations (json multiply)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      operation: {
        json: {
          foo: {
            multiply: 456
          }
        }
      }
    });

    assert.equal(
      statement,
      `WITH "Q0" AS (SELECT "operation_id" FROM "ez4-test-update-relation") ` +
        `UPDATE ONLY "ez4-test-update-operation" AS "T" SET "json"['foo'] = (("T"."json"->>'foo')::dec * (:0)::dec)::text::jsonb FROM "Q0" ` +
        `WHERE "T"."id" = "Q0"."operation_id"`
    );

    assert.deepEqual(variables, [456]);
  });

  it('assert :: prepare update operations (json divide)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      operation: {
        json: {
          foo: {
            divide: 456
          }
        }
      }
    });

    assert.equal(
      statement,
      `WITH "Q0" AS (SELECT "operation_id" FROM "ez4-test-update-relation") ` +
        `UPDATE ONLY "ez4-test-update-operation" AS "T" SET "json"['foo'] = (("T"."json"->>'foo')::dec / (:0)::dec)::text::jsonb FROM "Q0" ` +
        `WHERE "T"."id" = "Q0"."operation_id"`
    );

    assert.deepEqual(variables, [456]);
  });

  it('assert :: prepare update operations (json replace with)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      operation: {
        json: {
          replaceWith: {
            foo: 789
          }
        }
      }
    });

    assert.equal(
      statement,
      `WITH "Q0" AS (SELECT "operation_id" FROM "ez4-test-update-relation") ` +
        `UPDATE ONLY "ez4-test-update-operation" AS "T" SET "json" = :0 FROM "Q0" ` +
        `WHERE "T"."id" = "Q0"."operation_id"`
    );

    assert.deepEqual(variables, [
      {
        foo: 789
      }
    ]);
  });

  it('assert :: prepare update operations (json remove from)', async ({ assert }) => {
    const [statement] = await prepareUpdate({
      operation: {
        json: {
          bar: {
            removeFrom: true
          }
        }
      }
    });

    assert.equal(
      statement,
      `WITH "Q0" AS (SELECT "operation_id" FROM "ez4-test-update-relation") ` +
        `UPDATE ONLY "ez4-test-update-operation" AS "T" SET "json" = "T"."json" #- '{bar}' FROM "Q0" ` +
        `WHERE "T"."id" = "Q0"."operation_id"`
    );
  });

  it('assert :: prepare update operations (json update and remove from)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      operation: {
        json: {
          foo: 123,
          bar: {
            removeFrom: true
          }
        }
      }
    });

    assert.equal(
      statement,
      `WITH "Q0" AS (SELECT "operation_id" FROM "ez4-test-update-relation") ` +
        `UPDATE ONLY "ez4-test-update-operation" AS "T" SET "json" = "T"."json" #- '{bar}', "json"['foo'] = :0 FROM "Q0" ` +
        `WHERE "T"."id" = "Q0"."operation_id"`
    );

    assert.deepEqual(variables, [123]);
  });

  it('assert :: prepare update operations (invalid operator)', async ({ assert }) => {
    await assert.rejects(() =>
      prepareUpdate({
        operation: {
          scalar: {
            // The `wrong` column isn't a valid atomic operation.
            wrong: 123
          } as any
        }
      })
    );
  });

  it('assert :: prepare update operations (invalid operand)', async ({ assert }) => {
    await assert.rejects(() =>
      prepareUpdate({
        operation: {
          json: {
            foo: {
              // The given `123` value isn't a number type.
              decrement: '123' as any
            }
          }
        }
      })
    );
  });
});
