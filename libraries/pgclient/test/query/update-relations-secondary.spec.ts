import type { Query, RelationMetadata } from '@ez4/database';
import type { PostgresEngine } from '@ez4/pgclient/library';

import { describe, it } from 'node:test';

import { MalformedRequestError } from '@ez4/pgclient';
import { getRelationsWithSchema, prepareUpdateQuery } from '@ez4/pgclient/library';
import { SqlBuilder } from '@ez4/pgsql';

import { TestRelationRepository } from '../client/common/relation';

type TestTableMetadata = {
  engine: PostgresEngine;
  relations: RelationMetadata;
  indexes: {};
  schema: {};
};

describe('update secondary relations', () => {
  const tableName = 'table_a';

  const sourceId = '00000000-0000-1000-9000-000000000000';
  const targetId = '00000000-0000-1000-9000-000000000001';

  const prepareRelationUpdate = async <S extends Query.SelectInput<TestTableMetadata>>(
    query: Query.UpdateManyInput<S, TestTableMetadata>
  ) => {
    const repository = TestRelationRepository[tableName];
    const relations = getRelationsWithSchema(tableName, TestRelationRepository);
    const builder = new SqlBuilder();

    const allQueries = await prepareUpdateQuery(builder, tableName, repository.schema, relations, query);

    return builder.with(allQueries).build();
  };

  it('assert :: prepare empty relation (secondary to primary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationUpdate({
      select: {
        value: true,
        relation_1: {
          value: true
        }
      },
      data: {
        value: 'foo',
        relation_1: {}
      },
      where: {
        id_a: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT "R0"."value", (SELECT jsonb_build_object('value', "S0"."value") ` +
        `FROM "table_b" AS "S0" WHERE "S0"."id_b" = "R0"."relation_1_id") AS "relation_1" ` +
        `FROM "table_a" AS "R0" WHERE "R0"."id_a" = :0 FOR UPDATE), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "table_a" AS "U" SET "value" = :1 FROM "Q0" WHERE "U"."id_a" = :2) ` +
        // Return
        `SELECT "value", "relation_1" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', sourceId]);
  });

  it('assert :: prepare undefined relation (secondary to primary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationUpdate({
      select: {
        value: true,
        relation_1: {
          value: true
        }
      },
      data: {
        value: 'foo',
        relation_1: {
          id_b: undefined
        }
      },
      where: {
        id_a: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT "R0"."value", (SELECT jsonb_build_object('value', "S0"."value") ` +
        `FROM "table_b" AS "S0" WHERE "S0"."id_b" = "R0"."relation_1_id") AS "relation_1" ` +
        `FROM "table_a" AS "R0" WHERE "R0"."id_a" = :0 FOR UPDATE), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "table_a" AS "U" SET "value" = :1 FROM "Q0" WHERE "U"."id_a" = :2) ` +
        // Return
        `SELECT "value", "relation_1" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', sourceId]);
  });

  it('assert :: prepare update relation (secondary to primary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationUpdate({
      data: {
        value: 'foo',
        relation_1: {
          value: 'bar'
        }
      },
      where: {
        id_a: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (UPDATE ONLY "table_a" SET "value" = :0 WHERE "id_a" = :1 ` +
        `RETURNING "relation_1_id") ` +
        // Relation record
        `UPDATE ONLY "table_b" AS "T" SET "value" = :2 FROM "Q0" WHERE "T"."id_b" = "Q0"."relation_1_id"`
    );

    assert.deepEqual(variables, ['foo', sourceId, 'bar']);
  });

  it('assert :: prepare update and select relation (secondary to primary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationUpdate({
      select: {
        value: true,
        relation_1: {
          value: true
        }
      },
      data: {
        value: 'foo',
        relation_1: {
          value: 'bar'
        }
      },
      where: {
        id_a: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT "R0"."value", (SELECT jsonb_build_object('value', "S0"."value") ` +
        `FROM "table_b" AS "S0" WHERE "S0"."id_b" = "R0"."relation_1_id") AS "relation_1" ` +
        `FROM "table_a" AS "R0" WHERE "R0"."id_a" = :0 FOR UPDATE), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "table_a" AS "U" SET "value" = :1 FROM "Q0" WHERE "U"."id_a" = :2 ` +
        `RETURNING "U"."relation_1_id"), ` +
        // Relation record
        `"Q2" AS (UPDATE ONLY "table_b" AS "T" SET "value" = :3 FROM "Q1" WHERE "T"."id_b" = "Q1"."relation_1_id") ` +
        // Return
        `SELECT "value", "relation_1" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', sourceId, 'bar']);
  });

  it('assert :: prepare update, connect and select relation (secondary to primary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationUpdate({
      select: {
        value: true,
        relation_1: {
          value: true
        }
      },
      data: {
        value: 'foo',
        relation_1: {
          id_b: targetId
        }
      },
      where: {
        id_a: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT "R0"."value", (SELECT jsonb_build_object('value', "S0"."value") ` +
        `FROM "table_b" AS "S0" WHERE "S0"."id_b" = "R0"."relation_1_id") AS "relation_1" ` +
        `FROM "table_a" AS "R0" WHERE "R0"."id_a" = :0 FOR UPDATE), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "table_a" AS "U" SET "value" = :1, "relation_1_id" = :2 FROM "Q0" WHERE "U"."id_a" = :3) ` +
        // Return
        `SELECT "value", "relation_1" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', targetId, sourceId]);
  });

  it('assert :: prepare update, disconnect and select relation (secondary to primary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationUpdate({
      select: {
        value: true,
        relation_1: {
          value: true
        }
      },
      data: {
        value: 'foo',
        relation_1: {
          id_b: null
        }
      },
      where: {
        id_a: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT "R0"."value", (SELECT jsonb_build_object('value', "S0"."value") ` +
        `FROM "table_b" AS "S0" WHERE "S0"."id_b" = "R0"."relation_1_id") AS "relation_1" ` +
        `FROM "table_a" AS "R0" WHERE "R0"."id_a" = :0 FOR UPDATE), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "table_a" AS "U" SET "value" = :1, "relation_1_id" = null FROM "Q0" WHERE "U"."id_a" = :2) ` +
        // Return
        `SELECT "value", "relation_1" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', sourceId]);
  });

  it('assert :: prepare update invalid connection (secondary to primary)', async ({ assert }) => {
    await assert.rejects(
      () =>
        prepareRelationUpdate({
          data: {
            value: 'foo',
            relation_1: {
              id_b: targetId,

              // Extra fields aren't expected.
              extra: 'foo'
            }
          }
        }),
      MalformedRequestError
    );
  });

  it('assert :: prepare empty relation (secondary to unique)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationUpdate({
      select: {
        value: true,
        relation_2: {
          value: true
        }
      },
      data: {
        value: 'foo',
        relation_2: {}
      },
      where: {
        id_a: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT "R0"."value", (SELECT jsonb_build_object('value', "S0"."value") ` +
        `FROM "table_c" AS "S0" WHERE "S0"."unique_2_id" = "R0"."relation_2_id") AS "relation_2" ` +
        `FROM "table_a" AS "R0" WHERE "R0"."id_a" = :0 FOR UPDATE), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "table_a" AS "U" SET "value" = :1 FROM "Q0" WHERE "U"."id_a" = :2) ` +
        // Return
        `SELECT "value", "relation_2" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', sourceId]);
  });

  it('assert :: prepare undefined relation (secondary to unique)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationUpdate({
      select: {
        value: true,
        relation_2: {
          value: true
        }
      },
      data: {
        value: 'foo',
        relation_2: {
          id_c: undefined
        }
      },
      where: {
        id_a: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT "R0"."value", (SELECT jsonb_build_object('value', "S0"."value") ` +
        `FROM "table_c" AS "S0" WHERE "S0"."unique_2_id" = "R0"."relation_2_id") AS "relation_2" ` +
        `FROM "table_a" AS "R0" WHERE "R0"."id_a" = :0 FOR UPDATE), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "table_a" AS "U" SET "value" = :1 FROM "Q0" WHERE "U"."id_a" = :2) ` +
        // Return
        `SELECT "value", "relation_2" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', sourceId]);
  });

  it('assert :: prepare update relation (secondary to unique)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationUpdate({
      data: {
        value: 'foo',
        relation_2: {
          value: 'bar'
        }
      },
      where: {
        id_a: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (UPDATE ONLY "table_a" SET "value" = :0 WHERE "id_a" = :1 ` +
        `RETURNING "relation_2_id") ` +
        // Relation record
        `UPDATE ONLY "table_c" AS "T" SET "value" = :2 FROM "Q0" WHERE "T"."unique_2_id" = "Q0"."relation_2_id"`
    );

    assert.deepEqual(variables, ['foo', sourceId, 'bar']);
  });

  it('assert :: prepare update and select relation (secondary to unique)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationUpdate({
      select: {
        value: true,
        relation_2: {
          value: true
        }
      },
      data: {
        value: 'foo',
        relation_2: {
          value: 'bar'
        }
      },
      where: {
        id_a: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT "R0"."value", (SELECT jsonb_build_object('value', "S0"."value") ` +
        `FROM "table_c" AS "S0" WHERE "S0"."unique_2_id" = "R0"."relation_2_id") AS "relation_2" ` +
        `FROM "table_a" AS "R0" WHERE "R0"."id_a" = :0 FOR UPDATE), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "table_a" AS "U" SET "value" = :1 FROM "Q0" WHERE "U"."id_a" = :2 ` +
        `RETURNING "U"."relation_2_id"), ` +
        // Relation record
        `"Q2" AS (UPDATE ONLY "table_c" AS "T" SET "value" = :3 FROM "Q1" WHERE "T"."unique_2_id" = "Q1"."relation_2_id") ` +
        // Return
        `SELECT "value", "relation_2" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', sourceId, 'bar']);
  });

  it('assert :: prepare update, connect and select relation (secondary to unique)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationUpdate({
      select: {
        value: true,
        relation_2: {
          value: true
        }
      },
      data: {
        value: 'foo',
        relation_2: {
          unique_2_id: targetId
        }
      },
      where: {
        id_a: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        `"Q0" AS (SELECT "R0"."value", (SELECT jsonb_build_object('value', "S0"."value") ` +
        `FROM "table_c" AS "S0" WHERE "S0"."unique_2_id" = "R0"."relation_2_id") AS "relation_2" ` +
        `FROM "table_a" AS "R0" WHERE "R0"."id_a" = :0 FOR UPDATE), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "table_a" AS "U" SET "value" = :1, "relation_2_id" = :2 FROM "Q0" WHERE "U"."id_a" = :3) ` +
        // Return
        `SELECT "value", "relation_2" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', targetId, sourceId]);
  });

  it('assert :: prepare update, disconnect and select relation (secondary to unique)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationUpdate({
      select: {
        value: true,
        relation_2: {
          value: true
        }
      },
      data: {
        value: 'foo',
        relation_2: {
          unique_2_id: null
        }
      },
      where: {
        id_a: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT "R0"."value", (SELECT jsonb_build_object('value', "S0"."value") ` +
        `FROM "table_c" AS "S0" WHERE "S0"."unique_2_id" = "R0"."relation_2_id") AS "relation_2" ` +
        `FROM "table_a" AS "R0" WHERE "R0"."id_a" = :0 FOR UPDATE), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "table_a" AS "U" SET "value" = :1, "relation_2_id" = null FROM "Q0" WHERE "U"."id_a" = :2) ` +
        // Return
        `SELECT "value", "relation_2" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', sourceId]);
  });

  it('assert :: prepare update invalid connection (secondary to unique)', async ({ assert }) => {
    await assert.rejects(
      () =>
        prepareRelationUpdate({
          data: {
            value: 'foo',
            relation_2: {
              unique_2_id: targetId,

              // Extra fields aren't expected.
              extra: 'foo'
            }
          }
        }),
      MalformedRequestError
    );
  });
});
