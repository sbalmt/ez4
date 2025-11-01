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

describe('update unique relations', () => {
  const tableName = 'table_c';

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

  it('assert :: prepare empty relation (unique to primary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationUpdate({
      select: {
        value: true,
        relation: {
          value: true
        }
      },
      data: {
        value: 'foo',
        relation: {}
      },
      where: {
        id_c: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT "R0"."value", (SELECT jsonb_build_object('value', "S0"."value") ` +
        `FROM "table_b" AS "S0" WHERE "S0"."id_b" = "R0"."unique_1_id") AS "relation" ` +
        `FROM "table_c" AS "R0" WHERE "R0"."id_c" = :0), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "table_c" AS "U" SET "value" = :1 FROM "Q0" WHERE "U"."id_c" = :2) ` +
        // Return
        `SELECT "value", "relation" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', sourceId]);
  });

  it('assert :: prepare undefined relation (unique to primary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationUpdate({
      select: {
        value: true,
        relation: {
          value: true
        }
      },
      data: {
        value: 'foo',
        relation: {
          id_b: undefined
        }
      },
      where: {
        id_c: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT "R0"."value", (SELECT jsonb_build_object('value', "S0"."value") ` +
        `FROM "table_b" AS "S0" WHERE "S0"."id_b" = "R0"."unique_1_id") AS "relation" ` +
        `FROM "table_c" AS "R0" WHERE "R0"."id_c" = :0), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "table_c" AS "U" SET "value" = :1 FROM "Q0" WHERE "U"."id_c" = :2) ` +
        // Return
        `SELECT "value", "relation" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', sourceId]);
  });

  it('assert :: prepare update relation (unique to primary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationUpdate({
      data: {
        value: 'foo',
        relation: {
          value: 'bar'
        }
      },
      where: {
        id_c: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (UPDATE ONLY "table_c" SET "value" = :0 WHERE "id_c" = :1 ` +
        `RETURNING "unique_1_id") ` +
        // Relation record
        `UPDATE ONLY "table_b" AS "T" SET "value" = :2 FROM "Q0" WHERE "T"."id_b" = "Q0"."unique_1_id"`
    );

    assert.deepEqual(variables, ['foo', sourceId, 'bar']);
  });

  it('assert :: prepare update and select relation (unique to primary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationUpdate({
      select: {
        value: true,
        relation: {
          value: true
        }
      },
      data: {
        value: 'foo',
        relation: {
          value: 'bar'
        }
      },
      where: {
        id_c: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT "R0"."value", (SELECT jsonb_build_object('value', "S0"."value") ` +
        `FROM "table_b" AS "S0" WHERE "S0"."id_b" = "R0"."unique_1_id") AS "relation" ` +
        `FROM "table_c" AS "R0" WHERE "R0"."id_c" = :0), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "table_c" AS "U" SET "value" = :1 FROM "Q0" WHERE "U"."id_c" = :2 ` +
        `RETURNING "U"."unique_1_id"), ` +
        // Relation record
        `"Q2" AS (UPDATE ONLY "table_b" AS "T" SET "value" = :3 FROM "Q1" WHERE "T"."id_b" = "Q1"."unique_1_id") ` +
        // Return
        `SELECT "value", "relation" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', sourceId, 'bar']);
  });

  it('assert :: prepare update, connect and select relation (unique to primary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationUpdate({
      select: {
        value: true,
        relation: {
          value: true
        }
      },
      data: {
        value: 'foo',
        relation: {
          id_b: targetId
        }
      },
      where: {
        id_c: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT "R0"."value", (SELECT jsonb_build_object('value', "S0"."value") ` +
        `FROM "table_b" AS "S0" WHERE "S0"."id_b" = "R0"."unique_1_id") AS "relation" ` +
        `FROM "table_c" AS "R0" WHERE "R0"."id_c" = :0), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "table_c" AS "U" SET "value" = :1, "unique_1_id" = :2 FROM "Q0" WHERE "U"."id_c" = :3) ` +
        // Return
        `SELECT "value", "relation" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', targetId, sourceId]);
  });

  it('assert :: prepare update, disconnect and select relation (unique to primary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationUpdate({
      select: {
        value: true,
        relation: {
          value: true
        }
      },
      data: {
        value: 'foo',
        relation: {
          id_b: null
        }
      },
      where: {
        id_c: sourceId
      } as any
    });

    `WITH ` +
      `"Q0" AS (SELECT "R0"."value", (SELECT jsonb_build_object('value', "S0"."value") ` +
      `FROM "table_b" AS "S0" WHERE "S0"."id_b" = "R0"."unique_1_id") AS "relation" ` +
      `FROM "table_c" AS "R0" WHERE "R0"."id_c" = :0), ` +
      `"Q1" AS (UPDATE ONLY "table_c" AS "U" SET "value" = :1, "unique_1_id" = null FROM "Q0" WHERE "U"."id_c" = :2 ` +
      `RETURNING "U"."unique_1_id"), ` +
      `"Q2" AS (UPDATE ONLY "table_b" AS "T" SET "id_b" = null FROM "Q1" WHERE "T"."id_b" = "Q1"."unique_1_id") ` +
      `SELECT "value", "relation" FROM "Q0"`;

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT "R0"."value", (SELECT jsonb_build_object('value', "S0"."value") ` +
        `FROM "table_b" AS "S0" WHERE "S0"."id_b" = "R0"."unique_1_id") AS "relation" ` +
        `FROM "table_c" AS "R0" WHERE "R0"."id_c" = :0), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "table_c" AS "U" SET "value" = :1, "unique_1_id" = null FROM "Q0" WHERE "U"."id_c" = :2) ` +
        // Return
        `SELECT "value", "relation" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', sourceId]);
  });

  it('assert :: prepare update invalid connection (unique to primary)', async ({ assert }) => {
    await assert.rejects(
      () =>
        prepareRelationUpdate({
          data: {
            value: 'foo',
            relation: {
              id_b: targetId,

              // Extra fields aren't expected.
              extra: 'foo'
            }
          }
        }),
      MalformedRequestError
    );
  });

  it('assert :: prepare empty relation (unique to primary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationUpdate({
      select: {
        value: true,
        relation_unique: {
          value: true
        }
      },
      data: {
        value: 'foo',
        relation_unique: {}
      },
      where: {
        id_c: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT "R0"."value", (SELECT jsonb_build_object('value', "S0"."value") ` +
        `FROM "table_b" AS "S0" WHERE "S0"."unique_b" = "R0"."unique_3_id") AS "relation_unique" ` +
        `FROM "table_c" AS "R0" WHERE "R0"."id_c" = :0), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "table_c" AS "U" SET "value" = :1 FROM "Q0" WHERE "U"."id_c" = :2) ` +
        // Return
        `SELECT "value", "relation_unique" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', sourceId]);
  });

  it('assert :: prepare undefined relation (unique to unique)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationUpdate({
      select: {
        value: true,
        relation_unique: {
          value: true
        }
      },
      data: {
        value: 'foo',
        relation_unique: {
          unique_b: undefined
        }
      },
      where: {
        id_c: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT "R0"."value", (SELECT jsonb_build_object('value', "S0"."value") ` +
        `FROM "table_b" AS "S0" WHERE "S0"."unique_b" = "R0"."unique_3_id") AS "relation_unique" ` +
        `FROM "table_c" AS "R0" WHERE "R0"."id_c" = :0), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "table_c" AS "U" SET "value" = :1 FROM "Q0" WHERE "U"."id_c" = :2) ` +
        // Return
        `SELECT "value", "relation_unique" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', sourceId]);
  });

  it('assert :: prepare update relation (unique to unique)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationUpdate({
      data: {
        value: 'foo',
        relation_unique: {
          value: 'bar'
        }
      },
      where: {
        id_c: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (UPDATE ONLY "table_c" SET "value" = :0 WHERE "id_c" = :1 ` +
        `RETURNING "unique_3_id") ` +
        // Relation record
        `UPDATE ONLY "table_b" AS "T" SET "value" = :2 FROM "Q0" WHERE "T"."unique_b" = "Q0"."unique_3_id"`
    );

    assert.deepEqual(variables, ['foo', sourceId, 'bar']);
  });

  it('assert :: prepare update and select relation (unique to unique)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationUpdate({
      select: {
        value: true,
        relation_unique: {
          value: true
        }
      },
      data: {
        value: 'foo',
        relation_unique: {
          value: 'bar'
        }
      },
      where: {
        id_c: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT "R0"."value", (SELECT jsonb_build_object('value', "S0"."value") ` +
        `FROM "table_b" AS "S0" WHERE "S0"."unique_b" = "R0"."unique_3_id") AS "relation_unique" ` +
        `FROM "table_c" AS "R0" WHERE "R0"."id_c" = :0), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "table_c" AS "U" SET "value" = :1 FROM "Q0" WHERE "U"."id_c" = :2 ` +
        `RETURNING "U"."unique_3_id"), ` +
        // Relation record
        `"Q2" AS (UPDATE ONLY "table_b" AS "T" SET "value" = :3 FROM "Q1" WHERE "T"."unique_b" = "Q1"."unique_3_id") ` +
        // Return
        `SELECT "value", "relation_unique" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', sourceId, 'bar']);
  });

  it('assert :: prepare update, connect and select relation (unique to unique)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationUpdate({
      select: {
        value: true,
        relation_unique: {
          value: true
        }
      },
      data: {
        value: 'foo',
        relation_unique: {
          unique_b: targetId
        }
      },
      where: {
        id_c: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT "R0"."value", (SELECT jsonb_build_object('value', "S0"."value") ` +
        `FROM "table_b" AS "S0" WHERE "S0"."unique_b" = "R0"."unique_3_id") AS "relation_unique" ` +
        `FROM "table_c" AS "R0" WHERE "R0"."id_c" = :0), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "table_c" AS "U" SET "value" = :1 FROM "Q0" WHERE "U"."id_c" = :2 ` +
        `RETURNING "U"."unique_3_id"), ` +
        // Relation record (current)
        `"Q2" AS (UPDATE ONLY "table_b" AS "T" SET "unique_b" = null FROM "Q1" WHERE "T"."unique_b" = "Q1"."unique_3_id" ` +
        `RETURNING "Q1"."unique_3_id"), ` +
        // Relation record (new)
        `"Q3" AS (UPDATE ONLY "table_b" AS "T" SET "unique_b" = "Q2"."unique_3_id" FROM "Q2" WHERE "T"."unique_b" = :3) ` +
        // Return
        `SELECT "value", "relation_unique" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', sourceId, targetId]);
  });

  it('assert :: prepare update, disconnect and select relation (unique to unique)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationUpdate({
      select: {
        value: true,
        relation_unique: {
          value: true
        }
      },
      data: {
        value: 'foo',
        relation_unique: {
          unique_b: null
        }
      },
      where: {
        id_c: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT "R0"."value", (SELECT jsonb_build_object('value', "S0"."value") ` +
        `FROM "table_b" AS "S0" WHERE "S0"."unique_b" = "R0"."unique_3_id") AS "relation_unique" ` +
        `FROM "table_c" AS "R0" WHERE "R0"."id_c" = :0), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "table_c" AS "U" SET "value" = :1 FROM "Q0" WHERE "U"."id_c" = :2 ` +
        `RETURNING "U"."unique_3_id"), ` +
        // Relation record
        `"Q2" AS (UPDATE ONLY "table_b" AS "T" SET "unique_b" = null FROM "Q1" WHERE "T"."unique_b" = "Q1"."unique_3_id") ` +
        // Return
        `SELECT "value", "relation_unique" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', sourceId]);
  });

  it('assert :: prepare update invalid connection (unique to unique)', async ({ assert }) => {
    await assert.rejects(
      () =>
        prepareRelationUpdate({
          data: {
            value: 'foo',
            relation_unique: {
              unique_b: targetId,

              // Extra fields aren't expected.
              extra: 'foo'
            }
          }
        }),
      MalformedRequestError
    );
  });

  it('assert :: prepare empty relation (unique to secondary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationUpdate({
      select: {
        value: true,
        relations: {
          value: true
        }
      },
      data: {
        value: 'foo',
        relations: {}
      },
      where: {
        id_c: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT "R0"."value", ` +
        `(SELECT COALESCE(json_agg(jsonb_build_object('value', "S0"."value")), '[]'::json) ` +
        `FROM "table_a" AS "S0" WHERE "S0"."relation_2_id" = "R0"."unique_2_id") AS "relations" ` +
        `FROM "table_c" AS "R0" WHERE "R0"."id_c" = :0), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "table_c" AS "U" SET "value" = :1 FROM "Q0" WHERE "U"."id_c" = :2) ` +
        // Return
        `SELECT "value", "relations" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', sourceId]);
  });

  it('assert :: prepare undefined relation (unique to secondary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationUpdate({
      select: {
        value: true,
        relations: {
          value: true
        }
      },
      data: {
        value: 'foo',
        relations: {
          id_a: undefined
        }
      },
      where: {
        id_c: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT "R0"."value", ` +
        `(SELECT COALESCE(json_agg(jsonb_build_object('value', "S0"."value")), '[]'::json) ` +
        `FROM "table_a" AS "S0" WHERE "S0"."relation_2_id" = "R0"."unique_2_id") AS "relations" ` +
        `FROM "table_c" AS "R0" WHERE "R0"."id_c" = :0), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "table_c" AS "U" SET "value" = :1 FROM "Q0" WHERE "U"."id_c" = :2) ` +
        // Return
        `SELECT "value", "relations" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', sourceId]);
  });

  it('assert :: prepare update relation (unique to secondary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationUpdate({
      data: {
        value: 'foo',
        relations: {
          value: 'bar'
        }
      },
      where: {
        id_b: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (UPDATE ONLY "table_c" SET "value" = :0 WHERE "id_b" = :1 ` +
        `RETURNING "unique_2_id") ` +
        // Relation record
        `UPDATE ONLY "table_a" AS "T" SET "value" = :2 FROM "Q0" WHERE "T"."relation_2_id" = "Q0"."unique_2_id"`
    );

    assert.deepEqual(variables, ['foo', sourceId, 'bar']);
  });

  it('assert :: prepare update and select relation (unique to secondary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationUpdate({
      select: {
        value: true,
        relations: {
          value: true
        }
      },
      data: {
        value: 'foo',
        relations: {
          value: 'bar'
        }
      },
      where: {
        id_b: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT "R0"."value", ` +
        `(SELECT COALESCE(json_agg(jsonb_build_object('value', "S0"."value")), '[]'::json) ` +
        `FROM "table_a" AS "S0" WHERE "S0"."relation_2_id" = "R0"."unique_2_id") AS "relations" ` +
        `FROM "table_c" AS "R0" WHERE "R0"."id_b" = :0), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "table_c" AS "U" SET "value" = :1 FROM "Q0" WHERE "U"."id_b" = :2 ` +
        `RETURNING "U"."unique_2_id"), ` +
        // Relation record
        `"Q2" AS (UPDATE ONLY "table_a" AS "T" SET "value" = :3 FROM "Q1" WHERE "T"."relation_2_id" = "Q1"."unique_2_id") ` +
        // Return
        `SELECT "value", "relations" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', sourceId, 'bar']);
  });

  it('assert :: prepare update, connect and select relation (unique to secondary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationUpdate({
      select: {
        value: true,
        relations: {
          value: true
        }
      },
      data: {
        value: 'foo',
        relations: {
          id_a: targetId
        }
      },
      where: {
        id_c: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT "R0"."value", ` +
        `(SELECT COALESCE(json_agg(jsonb_build_object('value', "S0"."value")), '[]'::json) ` +
        `FROM "table_a" AS "S0" WHERE "S0"."relation_2_id" = "R0"."unique_2_id") AS "relations" ` +
        `FROM "table_c" AS "R0" WHERE "R0"."id_c" = :0), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "table_c" AS "U" SET "value" = :1 FROM "Q0" WHERE "U"."id_c" = :2 ` +
        `RETURNING "U"."unique_2_id"), ` +
        // Relation record
        `"Q2" AS (UPDATE ONLY "table_a" AS "T" SET "relation_2_id" = "Q1"."unique_2_id" FROM "Q1" WHERE "T"."id_a" = :3) ` +
        // Return
        `SELECT "value", "relations" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', sourceId, targetId]);
  });

  it('assert :: prepare update, disconnect and select relation (unique to secondary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationUpdate({
      select: {
        value: true,
        relations: {
          value: true
        }
      },
      data: {
        value: 'foo',
        relations: {
          id_a: null
        }
      },
      where: {
        id_c: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT "R0"."value", ` +
        `(SELECT COALESCE(json_agg(jsonb_build_object('value', "S0"."value")), '[]'::json) ` +
        `FROM "table_a" AS "S0" WHERE "S0"."relation_2_id" = "R0"."unique_2_id") AS "relations" ` +
        `FROM "table_c" AS "R0" WHERE "R0"."id_c" = :0), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "table_c" AS "U" SET "value" = :1 FROM "Q0" WHERE "U"."id_c" = :2 ` +
        `RETURNING "U"."unique_2_id"), ` +
        // Relation record
        `"Q2" AS (UPDATE ONLY "table_a" AS "T" SET "relation_2_id" = null FROM "Q1" WHERE "T"."relation_2_id" = "Q1"."unique_2_id") ` +
        // Return
        `SELECT "value", "relations" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', sourceId]);
  });

  it('assert :: prepare update invalid connection (unique to secondary)', async ({ assert }) => {
    await assert.rejects(
      () =>
        prepareRelationUpdate({
          data: {
            value: 'foo',
            relations: {
              id_a: targetId,

              // Extra fields aren't expected.
              extra: 'foo'
            }
          }
        }),
      MalformedRequestError
    );
  });
});
