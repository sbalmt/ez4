import type { Query, RelationMetadata } from '@ez4/database';
import type { PostgresEngine } from '@ez4/pgclient/library';

import { describe, it } from 'node:test';

import { MalformedRequestError } from '@ez4/pgclient';
import { getRelationsWithSchema, prepareInsertQuery } from '@ez4/pgclient/library';
import { SqlBuilder } from '@ez4/pgsql';

import { TestRelationRepository } from '../client/common/relation';

type TestTableMetadata = {
  engine: PostgresEngine;
  relations: RelationMetadata;
  indexes: {};
  schema: {};
};

describe('insert unique relations', () => {
  const tableName = 'table_c';

  const sourceId = '00000000-0000-1000-9000-000000000000';
  const targetId = '00000000-0000-1000-9000-000000000001';
  const uniqueId = '00000000-0000-1000-9000-000000000002';

  const targetAId = '00000000-0000-1000-9000-000000000002';
  const targetBId = '00000000-0000-1000-9000-000000000003';

  const prepareRelationInsert = async <S extends Query.SelectInput<TestTableMetadata>>(
    query: Query.InsertOneInput<S, TestTableMetadata>
  ) => {
    const repository = TestRelationRepository[tableName];
    const relations = getRelationsWithSchema(tableName, TestRelationRepository);
    const builder = new SqlBuilder();

    const allQueries = await prepareInsertQuery(builder, tableName, repository.schema, relations, query);

    return builder.with(allQueries).build();
  };

  it('assert :: prepare empty relation (unique to primary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      select: {
        id_c: true,
        value: true,
        relation: {
          id_b: true,
          value: true
        }
      },
      data: {
        id_c: sourceId,
        value: 'foo',
        relation: {}
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (INSERT INTO "table_c" ("id_c", "value") VALUES (:0, :1) ` +
        `RETURNING "id_c", "value", "unique_1_id") ` +
        // Return
        `SELECT "id_c", "value", ` +
        `(SELECT jsonb_build_object('id_b', "S0"."id_b", 'value', "S0"."value") ` +
        `FROM "table_b" AS "S0" WHERE "S0"."id_b" = "unique_1_id") AS "relation" ` +
        `FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo']);
  });

  it('assert :: prepare undefined relation (unique to primary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      select: {
        id_c: true,
        value: true,
        relation: {
          id_b: true,
          value: true
        }
      },
      data: {
        id_c: sourceId,
        value: 'foo',
        relation: {
          id_b: undefined
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (INSERT INTO "table_c" ("id_c", "value") VALUES (:0, :1) ` +
        `RETURNING "id_c", "value", "unique_1_id") ` +
        // Return
        `SELECT "id_c", "value", ` +
        `(SELECT jsonb_build_object('id_b', "S0"."id_b", 'value', "S0"."value") ` +
        `FROM "table_b" AS "S0" WHERE "S0"."id_b" = "unique_1_id") AS "relation" ` +
        `FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo']);
  });

  it('assert :: prepare null relation (unique to primary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      select: {
        id_c: true,
        value: true,
        relation: {
          id_b: true,
          value: true
        }
      },
      data: {
        id_c: sourceId,
        value: 'foo',
        relation: {
          id_b: null
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (INSERT INTO "table_c" ("id_c", "value") VALUES (:0, :1) ` +
        `RETURNING "id_c", "value", "unique_1_id") ` +
        // Return
        `SELECT "id_c", "value", ` +
        `(SELECT jsonb_build_object('id_b', "S0"."id_b", 'value', "S0"."value") ` +
        `FROM "table_b" AS "S0" WHERE "S0"."id_b" = "unique_1_id") AS "relation" ` +
        `FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo']);
  });

  it('assert :: prepare insert and create relation (unique to primary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      data: {
        id_c: sourceId,
        value: 'foo',
        relation: {
          id_b: targetId,
          value: 'bar'
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Relation record
        `"Q0" AS (INSERT INTO "table_b" ("id_b", "value") VALUES (:0, :1) ` +
        `RETURNING "id_b") ` +
        // Main record
        `INSERT INTO "table_c" ("id_c", "value", "unique_1_id") SELECT :2, :3, "Q0"."id_b" FROM "Q0"`
    );

    assert.deepEqual(variables, [targetId, 'bar', sourceId, 'foo']);
  });

  it('assert :: prepare insert, create and select relation (unique to primary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      select: {
        id_c: true,
        value: true,
        relation: {
          id_b: true,
          value: true
        }
      },
      data: {
        id_c: sourceId,
        value: 'foo',
        relation: {
          id_b: targetId,
          value: 'bar'
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Relation record
        `"Q0" AS (INSERT INTO "table_b" ("id_b", "value") VALUES (:0, :1) ` +
        `RETURNING "id_b", "value"), ` +
        // Main record
        `"Q1" AS (INSERT INTO "table_c" ("id_c", "value", "unique_1_id") SELECT :2, :3, "Q0"."id_b" FROM "Q0" ` +
        `RETURNING "id_c", "value") ` +
        // Return
        `SELECT "id_c", "value", ` +
        `(SELECT jsonb_build_object('id_b', "id_b", 'value', "value") ` +
        `FROM "Q0") AS "relation" ` +
        `FROM "Q1"`
    );

    assert.deepEqual(variables, [targetId, 'bar', sourceId, 'foo']);
  });

  it('assert :: prepare insert, connect and select relation (unique to primary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      select: {
        id_c: true,
        value: true,
        relation: {
          id_b: true,
          value: true
        }
      },
      data: {
        id_c: sourceId,
        value: 'foo',
        relation: {
          id_b: targetId
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (INSERT INTO "table_c" ("id_c", "value", "unique_1_id") VALUES (:0, :1, :2) ` +
        `RETURNING "id_c", "value", "unique_1_id") ` +
        // Return
        `SELECT "id_c", "value", ` +
        `(SELECT jsonb_build_object('id_b', "S0"."id_b", 'value', "S0"."value") ` +
        `FROM "table_b" AS "S0" WHERE "S0"."id_b" = "unique_1_id") AS "relation" ` +
        `FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', targetId]);
  });

  it('assert :: prepare insert invalid create/connect (unique to primary)', async ({ assert }) => {
    await assert.rejects(
      () =>
        prepareRelationInsert({
          data: {
            id_c: sourceId,
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

  it('assert :: prepare empty relation (unique to unique)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      select: {
        id_c: true,
        value: true,
        unique_3_id: true,
        relation_unique: {
          id_b: true,
          value: true
        }
      },
      data: {
        id_c: sourceId,
        value: 'foo',
        relation_unique: {}
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (INSERT INTO "table_c" ("id_c", "value") VALUES (:0, :1) ` +
        `RETURNING "id_c", "value", "unique_3_id") ` +
        // Return
        `SELECT "id_c", "value", "unique_3_id", ` +
        `(SELECT jsonb_build_object('id_b', "S0"."id_b", 'value', "S0"."value") ` +
        `FROM "table_b" AS "S0" WHERE "S0"."unique_b" = "unique_3_id") AS "relation_unique" ` +
        `FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo']);
  });

  it('assert :: prepare undefined relation (unique to unique)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      select: {
        id_c: true,
        value: true,
        unique_3_id: true,
        relation_unique: {
          id_b: true,
          value: true
        }
      },
      data: {
        id_c: sourceId,
        value: 'foo',
        relation_unique: {
          unique_b: undefined
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (INSERT INTO "table_c" ("id_c", "value") VALUES (:0, :1) ` +
        `RETURNING "id_c", "value", "unique_3_id") ` +
        // Return
        `SELECT "id_c", "value", "unique_3_id", ` +
        `(SELECT jsonb_build_object('id_b', "S0"."id_b", 'value', "S0"."value") ` +
        `FROM "table_b" AS "S0" WHERE "S0"."unique_b" = "unique_3_id") AS "relation_unique" ` +
        `FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo']);
  });

  it('assert :: prepare null relation (unique to unique)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      select: {
        id_c: true,
        value: true,
        unique_3_id: true,
        relation_unique: {
          id_b: true,
          value: true
        }
      },
      data: {
        id_c: sourceId,
        value: 'foo',
        relation_unique: {
          unique_b: null
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (INSERT INTO "table_c" ("id_c", "value") VALUES (:0, :1) ` +
        `RETURNING "id_c", "value", "unique_3_id") ` +
        // Return
        `SELECT "id_c", "value", "unique_3_id", ` +
        `(SELECT jsonb_build_object('id_b', "S0"."id_b", 'value', "S0"."value") ` +
        `FROM "table_b" AS "S0" WHERE "S0"."unique_b" = "unique_3_id") AS "relation_unique" ` +
        `FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo']);
  });

  it('assert :: prepare insert and create relation (unique to unique)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      data: {
        id_c: sourceId,
        value: 'foo',
        relation_unique: {
          id_b: targetId,
          unique_b: uniqueId,
          value: 'bar'
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Relation record
        `"Q0" AS (INSERT INTO "table_b" ("id_b", "unique_b", "value") VALUES (:0, :1, :2) ` +
        `RETURNING "unique_b") ` +
        // Main record
        `INSERT INTO "table_c" ("id_c", "value", "unique_3_id") SELECT :3, :4, "Q0"."unique_b" FROM "Q0"`
    );

    assert.deepEqual(variables, [targetId, uniqueId, 'bar', sourceId, 'foo']);
  });

  it('assert :: prepare insert, create and select relation (unique to unique)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      select: {
        id_c: true,
        value: true,
        unique_3_id: true,
        relation_unique: {
          id_b: true,
          value: true
        }
      },
      data: {
        id_c: sourceId,
        value: 'foo',
        relation_unique: {
          id_b: targetId,
          unique_b: uniqueId,
          value: 'bar'
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Relation record
        `"Q0" AS (INSERT INTO "table_b" ("id_b", "unique_b", "value") VALUES (:0, :1, :2) ` +
        `RETURNING "unique_b", "id_b", "value"), ` +
        // Main record
        `"Q1" AS (INSERT INTO "table_c" ("id_c", "value", "unique_3_id") SELECT :3, :4, "Q0"."unique_b" FROM "Q0" ` +
        `RETURNING "id_c", "value", "unique_3_id") ` +
        // Return
        `SELECT "id_c", "value", "unique_3_id", ` +
        `(SELECT jsonb_build_object('id_b', "id_b", 'value', "value") ` +
        `FROM "Q0") AS "relation_unique" ` +
        `FROM "Q1"`
    );

    assert.deepEqual(variables, [targetId, uniqueId, 'bar', sourceId, 'foo']);
  });

  it('assert :: prepare insert, connect and select relation (unique to unique)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      select: {
        id_c: true,
        value: true,
        unique_3_id: true,
        relation_unique: {
          id_b: true,
          value: true
        }
      },
      data: {
        id_c: sourceId,
        value: 'foo',
        relation_unique: {
          unique_b: uniqueId
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (INSERT INTO "table_c" ("id_c", "value", "unique_3_id") VALUES (:0, :1, :2) ` +
        `RETURNING "id_c", "value", "unique_3_id") ` +
        // Return
        `SELECT "id_c", "value", "unique_3_id", ` +
        `(SELECT jsonb_build_object('id_b', "S0"."id_b", 'value', "S0"."value") ` +
        `FROM "table_b" AS "S0" WHERE "S0"."unique_b" = "unique_3_id") AS "relation_unique" ` +
        `FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', uniqueId]);
  });

  it('assert :: prepare insert invalid create/connect (unique to unique)', async ({ assert }) => {
    await assert.rejects(
      () =>
        prepareRelationInsert({
          data: {
            id_c: sourceId,
            value: 'foo',
            relation_unique: {
              unique_b: uniqueId,

              // Extra fields aren't expected.
              extra: 'foo'
            }
          }
        }),
      MalformedRequestError
    );
  });

  it('assert :: prepare empty, undefined and null relation (unique to secondary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      select: {
        id_c: true,
        value: true,
        relations: {
          id_a: true,
          value: true
        }
      },
      data: {
        id_c: sourceId,
        unique_2_id: uniqueId,
        value: 'foo',
        relations: [
          {},
          {
            id_a: undefined
          },
          {
            id_a: null
          }
        ]
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (INSERT INTO "table_c" ("id_c", "unique_2_id", "value") VALUES (:0, :1, :2) ` +
        `RETURNING "id_c", "value", "unique_2_id") ` +
        // Return
        `SELECT "id_c", "value", ` +
        `(SELECT COALESCE(json_agg(jsonb_build_object('id_a', "S0"."id_a", 'value', "S0"."value")), '[]'::json) ` +
        `FROM "table_a" AS "S0" WHERE "S0"."relation_2_id" = "unique_2_id") AS "relations" ` +
        `FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, uniqueId, 'foo']);
  });

  it('assert :: prepare insert and create relation (unique to secondary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      data: {
        id_c: sourceId,
        unique_2_id: uniqueId,
        value: 'foo',
        relations: [
          {
            id_a: targetAId,
            value: 'bar'
          },
          {
            id_a: targetBId,
            value: 'baz'
          }
        ]
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (INSERT INTO "table_c" ("id_c", "unique_2_id", "value") VALUES (:0, :1, :2) ` +
        `RETURNING "unique_2_id"), ` +
        // First relation
        `"Q1" AS (INSERT INTO "table_a" ("id_a", "value", "relation_2_id") SELECT :3, :4, "Q0"."unique_2_id" FROM "Q0") ` +
        // Second relation
        `INSERT INTO "table_a" ("id_a", "value", "relation_2_id") SELECT :5, :6, "Q0"."unique_2_id" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, uniqueId, 'foo', targetAId, 'bar', targetBId, 'baz']);
  });

  it('assert :: prepare insert, create and select relation (unique to secondary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      select: {
        id_c: true,
        value: true,
        relations: {
          id_a: true,
          value: true
        }
      },
      data: {
        id_c: sourceId,
        unique_2_id: uniqueId,
        value: 'foo',
        relations: [
          {
            id_a: targetAId,
            value: 'bar'
          },
          {
            id_a: targetBId,
            value: 'baz'
          }
        ]
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (INSERT INTO "table_c" ("id_c", "unique_2_id", "value") VALUES (:0, :1, :2) ` +
        `RETURNING "unique_2_id", "id_c", "value"), ` +
        // First relation
        `"Q1" AS (INSERT INTO "table_a" ("id_a", "value", "relation_2_id") SELECT :3, :4, "Q0"."unique_2_id" FROM "Q0" ` +
        `RETURNING "id_a", "value"), ` +
        // Second relation
        `"Q2" AS (INSERT INTO "table_a" ("id_a", "value", "relation_2_id") SELECT :5, :6, "Q0"."unique_2_id" FROM "Q0" ` +
        `RETURNING "id_a", "value") ` +
        // Return
        `SELECT "id_c", "value", ` +
        `(SELECT COALESCE(json_agg(jsonb_build_object('id_a', "id_a", 'value', "value")), '[]'::json) ` +
        `FROM (SELECT * FROM "Q1" UNION ALL SELECT * FROM "Q2")) AS "relations" ` +
        `FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, uniqueId, 'foo', targetAId, 'bar', targetBId, 'baz']);
  });

  it('assert :: prepare insert, connect and select relation (unique to secondary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      select: {
        id_c: true,
        value: true,
        relations: {
          id_a: true,
          value: true
        }
      },
      data: {
        id_c: sourceId,
        unique_2_id: uniqueId,
        value: 'foo',
        relations: [
          {
            id_a: targetAId
          },
          {
            id_a: targetBId
          }
        ]
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (INSERT INTO "table_c" ("id_c", "unique_2_id", "value") VALUES (:0, :1, :2) ` +
        `RETURNING "unique_2_id", "id_c", "value"), ` +
        // First relation
        `"Q1" AS (UPDATE ONLY "table_a" AS "T" SET "relation_2_id" = "Q0"."unique_2_id" FROM "Q0" WHERE "T"."id_a" = :3 ` +
        `RETURNING "T"."id_a", "T"."value"), ` +
        // Second relation
        `"Q2" AS (UPDATE ONLY "table_a" AS "T" SET "relation_2_id" = "Q0"."unique_2_id" FROM "Q0" WHERE "T"."id_a" = :4 ` +
        `RETURNING "T"."id_a", "T"."value") ` +
        // Return
        `SELECT "id_c", "value", ` +
        `(SELECT COALESCE(json_agg(jsonb_build_object('id_a', "id_a", 'value', "value")), '[]'::json) ` +
        `FROM (SELECT * FROM "Q1" UNION ALL SELECT * FROM "Q2")) AS "relations" ` +
        `FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, uniqueId, 'foo', targetAId, targetBId]);
  });

  it('assert :: prepare insert invalid create/connect (unique to secondary)', async ({ assert }) => {
    await assert.rejects(
      () =>
        prepareRelationInsert({
          data: {
            id_b: sourceId,
            value: 'foo',
            relations: [
              {
                id_a: targetAId,

                // Extra fields aren't expected.
                extra: 'foo'
              }
            ]
          }
        }),
      MalformedRequestError
    );
  });
});
