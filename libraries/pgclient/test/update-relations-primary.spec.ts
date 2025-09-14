import type { Query, RelationMetadata } from '@ez4/database';
import type { PostgresEngine } from '@ez4/pgclient/library';

import { describe, it } from 'node:test';

import { MalformedRequestError } from '@ez4/pgclient';
import { getRelationsWithSchema, prepareUpdateQuery } from '@ez4/pgclient/library';
import { SqlBuilder } from '@ez4/pgsql';

import { TestRelationRepository } from './common/relation';

type TestTableMetadata = {
  engine: PostgresEngine;
  relations: RelationMetadata;
  indexes: {};
  schema: {};
};

describe('update primary relations', () => {
  const tableName = 'table_b';

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

  it('assert :: prepare empty relation (primary to unique)', async ({ assert }) => {
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
        id_b: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT "R0"."value", (SELECT jsonb_build_object('value', "S0"."value") ` +
        `FROM "table_c" AS "S0" WHERE "S0"."unique_1_id" = "R0"."id_b") AS "relation" ` +
        `FROM "table_b" AS "R0" WHERE "R0"."id_b" = :0 FOR UPDATE), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "table_b" AS "U" SET "value" = :1 FROM "Q0" WHERE "U"."id_b" = :2) ` +
        // Return
        `SELECT "value", "relation" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', sourceId]);
  });

  it('assert :: prepare undefined relation (primary to unique)', async ({ assert }) => {
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
          unique_1_id: undefined
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
        `"Q0" AS (SELECT "R0"."value", (SELECT jsonb_build_object('value', "S0"."value") ` +
        `FROM "table_c" AS "S0" WHERE "S0"."unique_1_id" = "R0"."id_b") AS "relation" ` +
        `FROM "table_b" AS "R0" WHERE "R0"."id_b" = :0 FOR UPDATE), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "table_b" AS "U" SET "value" = :1 FROM "Q0" WHERE "U"."id_b" = :2) ` +
        // Return
        `SELECT "value", "relation" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', sourceId]);
  });

  it('assert :: prepare update and select relation (primary to unique)', async ({ assert }) => {
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
        id_b: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT "R0"."value", (SELECT jsonb_build_object('value', "S0"."value") ` +
        `FROM "table_c" AS "S0" WHERE "S0"."unique_1_id" = "R0"."id_b") AS "relation" ` +
        `FROM "table_b" AS "R0" WHERE "R0"."id_b" = :0 FOR UPDATE), ` +
        // Relation record
        `"Q1" AS (UPDATE ONLY "table_b" AS "U" SET "value" = :1 FROM "Q0" WHERE "U"."id_b" = :2 ` +
        `RETURNING "U"."id_b"), ` +
        // Main record
        `"Q2" AS (UPDATE ONLY "table_c" AS "T" SET "value" = :3 FROM "Q1" WHERE "T"."unique_1_id" = "Q1"."id_b") ` +
        // Return
        `SELECT "value", "relation" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', sourceId, 'bar']);
  });

  it('assert :: prepare update, connect and select relation (primary to unique)', async ({ assert }) => {
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
          unique_1_id: targetId
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
        `"Q0" AS (SELECT "R0"."value", (SELECT jsonb_build_object('value', "S0"."value") ` +
        `FROM "table_c" AS "S0" WHERE "S0"."unique_1_id" = "R0"."id_b") AS "relation" ` +
        `FROM "table_b" AS "R0" WHERE "R0"."id_b" = :0 FOR UPDATE), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "table_b" AS "U" SET "value" = :1 FROM "Q0" WHERE "U"."id_b" = :2 ` +
        `RETURNING "U"."id_b"), ` +
        // Relation record (current)
        `"Q2" AS (UPDATE ONLY "table_c" AS "T" SET "unique_1_id" = null FROM "Q1" WHERE "T"."unique_1_id" = "Q1"."id_b" ` +
        `RETURNING "Q1"."id_b"), ` +
        // Relation record (new)
        `"Q3" AS (UPDATE ONLY "table_c" AS "T" SET "unique_1_id" = "Q2"."id_b" FROM "Q2" WHERE "T"."unique_1_id" = :3) ` +
        // Return
        `SELECT "value", "relation" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', sourceId, targetId]);
  });

  it('assert :: prepare update, disconnect and select relation (primary to unique)', async ({ assert }) => {
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
          unique_1_id: null
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
        `"Q0" AS (SELECT "R0"."value", (SELECT jsonb_build_object('value', "S0"."value") ` +
        `FROM "table_c" AS "S0" WHERE "S0"."unique_1_id" = "R0"."id_b") AS "relation" ` +
        `FROM "table_b" AS "R0" WHERE "R0"."id_b" = :0 FOR UPDATE), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "table_b" AS "U" SET "value" = :1 FROM "Q0" WHERE "U"."id_b" = :2 ` +
        `RETURNING "U"."id_b"), ` +
        // Relation record
        `"Q2" AS (UPDATE ONLY "table_c" AS "T" SET "unique_1_id" = null FROM "Q1" WHERE "T"."unique_1_id" = "Q1"."id_b") ` +
        // Return
        `SELECT "value", "relation" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', sourceId]);
  });

  it('assert :: prepare update invalid connection (primary to unique)', async ({ assert }) => {
    await assert.rejects(
      () =>
        prepareRelationUpdate({
          data: {
            value: 'foo',
            relation: {
              unique_1_id: targetId,

              // Extra fields aren't expected.
              extra: 'foo'
            }
          }
        }),
      MalformedRequestError
    );
  });

  it('assert :: prepare empty relation (primary to secondary)', async ({ assert }) => {
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
        id_b: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT "R0"."value", ` +
        `(SELECT COALESCE(json_agg(jsonb_build_object('value', "S0"."value")), '[]'::json) ` +
        `FROM "table_a" AS "S0" WHERE "S0"."relation_1_id" = "R0"."id_b") AS "relations" ` +
        `FROM "table_b" AS "R0" WHERE "R0"."id_b" = :0 FOR UPDATE), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "table_b" AS "U" SET "value" = :1 FROM "Q0" WHERE "U"."id_b" = :2) ` +
        // Return
        `SELECT "value", "relations" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', sourceId]);
  });

  it('assert :: prepare undefined relation (primary to secondary)', async ({ assert }) => {
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
        id_b: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT "R0"."value", ` +
        `(SELECT COALESCE(json_agg(jsonb_build_object('value', "S0"."value")), '[]'::json) ` +
        `FROM "table_a" AS "S0" WHERE "S0"."relation_1_id" = "R0"."id_b") AS "relations" ` +
        `FROM "table_b" AS "R0" WHERE "R0"."id_b" = :0 FOR UPDATE), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "table_b" AS "U" SET "value" = :1 FROM "Q0" WHERE "U"."id_b" = :2) ` +
        // Return
        `SELECT "value", "relations" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', sourceId]);
  });

  it('assert :: prepare update, create and select relation (primary to secondary)', async ({ assert }) => {
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
        `FROM "table_a" AS "S0" WHERE "S0"."relation_1_id" = "R0"."id_b") AS "relations" ` +
        `FROM "table_b" AS "R0" WHERE "R0"."id_b" = :0 FOR UPDATE), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "table_b" AS "U" SET "value" = :1 FROM "Q0" WHERE "U"."id_b" = :2 ` +
        `RETURNING "U"."id_b"), ` +
        // Relation record
        `"Q2" AS (UPDATE ONLY "table_a" AS "T" SET "value" = :3 FROM "Q1" WHERE "T"."relation_1_id" = "Q1"."id_b") ` +
        // Return
        `SELECT "value", "relations" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', sourceId, 'bar']);
  });

  it('assert :: prepare update, connect and select relation (primary to secondary)', async ({ assert }) => {
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
        id_b: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT "R0"."value", ` +
        `(SELECT COALESCE(json_agg(jsonb_build_object('value', "S0"."value")), '[]'::json) ` +
        `FROM "table_a" AS "S0" WHERE "S0"."relation_1_id" = "R0"."id_b") AS "relations" ` +
        `FROM "table_b" AS "R0" WHERE "R0"."id_b" = :0 FOR UPDATE), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "table_b" AS "U" SET "value" = :1 FROM "Q0" WHERE "U"."id_b" = :2 ` +
        `RETURNING "U"."id_b"), ` +
        // Relation record
        `"Q2" AS (UPDATE ONLY "table_a" AS "T" SET "relation_1_id" = "Q1"."id_b" FROM "Q1" WHERE "T"."id_a" = :3) ` +
        // Return
        `SELECT "value", "relations" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', sourceId, targetId]);
  });

  it('assert :: prepare update, disconnect and select relation (primary to secondary)', async ({ assert }) => {
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
        id_b: sourceId
      } as any
    });

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT "R0"."value", ` +
        `(SELECT COALESCE(json_agg(jsonb_build_object('value', "S0"."value")), '[]'::json) ` +
        `FROM "table_a" AS "S0" WHERE "S0"."relation_1_id" = "R0"."id_b") AS "relations" ` +
        `FROM "table_b" AS "R0" WHERE "R0"."id_b" = :0 FOR UPDATE), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "table_b" AS "U" SET "value" = :1 FROM "Q0" WHERE "U"."id_b" = :2 ` +
        `RETURNING "U"."id_b"), ` +
        // Relation record
        `"Q2" AS (UPDATE ONLY "table_a" AS "T" SET "relation_1_id" = null FROM "Q1" WHERE "T"."relation_1_id" = "Q1"."id_b") ` +
        // Return
        `SELECT "value", "relations" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', sourceId]);
  });

  it('assert :: prepare update invalid connection (primary to secondary)', async ({ assert }) => {
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
