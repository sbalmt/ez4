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

describe('insert primary relations', () => {
  const tableName = 'table_b';

  const sourceId = '00000000-0000-1000-9000-000000000000';
  const targetId = '00000000-0000-1000-9000-000000000001';

  const targetAId = '00000000-0000-1000-9000-000000000001';
  const targetBId = '00000000-0000-1000-9000-000000000002';

  const prepareRelationInsert = async <S extends Query.SelectInput<TestTableMetadata>>(
    query: Query.InsertOneInput<S, TestTableMetadata>
  ) => {
    const repository = TestRelationRepository[tableName];
    const relations = getRelationsWithSchema(tableName, TestRelationRepository);
    const builder = new SqlBuilder();

    const allQueries = await prepareInsertQuery(builder, tableName, repository.schema, relations, query);

    return builder.with(allQueries).build();
  };

  it('assert :: prepare empty relation (primary to unique)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      select: {
        id_b: true,
        value: true,
        relation: {
          id_c: true,
          value: true
        }
      },
      data: {
        id_b: sourceId,
        value: 'foo',
        relation: {}
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (INSERT INTO "table_b" ("id_b", "value") VALUES (:0, :1) ` +
        `RETURNING "id_b", "value") ` +
        // Return
        `SELECT "id_b", "value", ` +
        `(SELECT jsonb_build_object('id_c', "S0"."id_c", 'value', "S0"."value") ` +
        `FROM "table_c" AS "S0" WHERE "S0"."unique_1_id" = "id_b") AS "relation" ` +
        `FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo']);
  });

  it('assert :: prepare undefined relation (primary to unique)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      select: {
        id_b: true,
        value: true,
        relation: {
          id_c: true,
          value: true
        }
      },
      data: {
        id_b: sourceId,
        value: 'foo',
        relation: {
          unique_1_id: undefined
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (INSERT INTO "table_b" ("id_b", "value") VALUES (:0, :1) ` +
        `RETURNING "id_b", "value") ` +
        // Return
        `SELECT "id_b", "value", ` +
        `(SELECT jsonb_build_object('id_c', "S0"."id_c", 'value', "S0"."value") ` +
        `FROM "table_c" AS "S0" WHERE "S0"."unique_1_id" = "id_b") AS "relation" ` +
        `FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo']);
  });

  it('assert :: prepare null relation (primary to unique)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      select: {
        id_b: true,
        value: true,
        relation: {
          id_c: true,
          value: true
        }
      },
      data: {
        id_b: sourceId,
        value: 'foo',
        relation: {
          unique_1_id: null
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (INSERT INTO "table_b" ("id_b", "value") VALUES (:0, :1) ` +
        `RETURNING "id_b", "value") ` +
        // Return
        `SELECT "id_b", "value", ` +
        `(SELECT jsonb_build_object('id_c', "S0"."id_c", 'value', "S0"."value") ` +
        `FROM "table_c" AS "S0" WHERE "S0"."unique_1_id" = "id_b") AS "relation" ` +
        `FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo']);
  });

  it('assert :: prepare insert and create relation (primary to unique)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      data: {
        id_b: sourceId,
        value: 'foo',
        relation: {
          id_c: targetId,
          value: 'bar'
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (INSERT INTO "table_b" ("id_b", "value") VALUES (:0, :1) ` +
        `RETURNING "id_b") ` +
        // Relation record
        `INSERT INTO "table_c" ("id_c", "value", "unique_1_id") SELECT :2, :3, "Q0"."id_b" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', targetId, 'bar']);
  });

  it('assert :: prepare insert, create and select relation (primary to unique)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      select: {
        id_b: true,
        value: true,
        relation: {
          id_c: true,
          value: true
        }
      },
      data: {
        id_b: sourceId,
        value: 'foo',
        relation: {
          id_c: targetId,
          value: 'bar'
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (INSERT INTO "table_b" ("id_b", "value") VALUES (:0, :1) ` +
        `RETURNING "id_b", "value"), ` +
        // Relation record
        `"Q1" AS (INSERT INTO "table_c" ("id_c", "value", "unique_1_id") SELECT :2, :3, "Q0"."id_b" FROM "Q0" ` +
        `RETURNING "id_c", "value") ` +
        // Return
        `SELECT "id_b", "value", ` +
        `(SELECT jsonb_build_object('id_c', "id_c", 'value', "value") ` +
        `FROM "Q1") AS "relation" ` +
        `FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', targetId, 'bar']);
  });

  it('assert :: prepare insert, connect and select relation (primary to unique)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      select: {
        id_b: true,
        value: true,
        relation: {
          id_c: true,
          value: true
        }
      },
      data: {
        id_b: sourceId,
        value: 'foo',
        relation: {
          unique_1_id: targetId
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (INSERT INTO "table_b" ("id_b", "value") VALUES (:0, :1) ` +
        `RETURNING "id_b", "value"), ` +
        // Relation record
        `"Q1" AS (UPDATE ONLY "table_c" AS "T" SET "unique_1_id" = "Q0"."id_b" FROM "Q0" WHERE "T"."unique_1_id" = :2 ` +
        `RETURNING "T"."id_c", "T"."value") ` +
        // Return
        `SELECT "id_b", "value", ` +
        `(SELECT jsonb_build_object('id_c', "id_c", 'value', "value") ` +
        `FROM "Q1") AS "relation" ` +
        `FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', targetId]);
  });

  it('assert :: prepare insert invalid create/connect (primary to unique)', async ({ assert }) => {
    await assert.rejects(
      () =>
        prepareRelationInsert({
          data: {
            id_b: sourceId,
            value: 'foo',
            relation: {
              id_c: targetId,

              // Extra fields aren't expected.
              extra: 'foo'
            }
          }
        }),
      MalformedRequestError
    );
  });

  it('assert :: prepare empty, undefined and null relation (primary to secondary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      select: {
        id_b: true,
        value: true,
        relation: {
          id_c: true,
          value: true
        }
      },
      data: {
        id_b: sourceId,
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
        `"Q0" AS (INSERT INTO "table_b" ("id_b", "value") VALUES (:0, :1) ` +
        `RETURNING "id_b", "value") ` +
        // Return
        `SELECT "id_b", "value", ` +
        `(SELECT jsonb_build_object('id_c', "S0"."id_c", 'value', "S0"."value") ` +
        `FROM "table_c" AS "S0" WHERE "S0"."unique_1_id" = "id_b") AS "relation" ` +
        `FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo']);
  });

  it('assert :: prepare insert and create relation (primary to secondary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      data: {
        id_b: sourceId,
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
        `"Q0" AS (INSERT INTO "table_b" ("id_b", "value") VALUES (:0, :1) ` +
        `RETURNING "id_b"), ` +
        // First relation
        `"Q1" AS (INSERT INTO "table_a" ("id_a", "value", "relation_1_id") SELECT :2, :3, "Q0"."id_b" FROM "Q0") ` +
        // Second relation
        `INSERT INTO "table_a" ("id_a", "value", "relation_1_id") SELECT :4, :5, "Q0"."id_b" FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', targetAId, 'bar', targetBId, 'baz']);
  });

  it('assert :: prepare insert, create and select relation (primary to secondary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      select: {
        id_b: true,
        value: true,
        relations: {
          id_a: true,
          value: true
        }
      },
      data: {
        id_b: sourceId,
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

    `(SELECT COALESCE(json_agg(jsonb_build_object('id_a', "id_a", 'value', "value")), '[]'::json) FROM (SELECT * FROM "Q1" UNION ALL SELECT * FROM "Q2") AS "U0") AS "relations" FROM "Q0"`;

    console.log(statement);

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (INSERT INTO "table_b" ("id_b", "value") VALUES (:0, :1) ` +
        `RETURNING "id_b", "value"), ` +
        // First relation
        `"Q1" AS (INSERT INTO "table_a" ("id_a", "value", "relation_1_id") SELECT :2, :3, "Q0"."id_b" FROM "Q0" ` +
        `RETURNING "id_a", "value"), ` +
        // Second relation
        `"Q2" AS (INSERT INTO "table_a" ("id_a", "value", "relation_1_id") SELECT :4, :5, "Q0"."id_b" FROM "Q0" ` +
        `RETURNING "id_a", "value") ` +
        // Return
        `SELECT "id_b", "value", ` +
        `(SELECT COALESCE(json_agg(jsonb_build_object('id_a', "id_a", 'value', "value")), '[]'::json) ` +
        `FROM (SELECT * FROM "Q1" UNION ALL SELECT * FROM "Q2") AS "U0") AS "relations" ` +
        `FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', targetAId, 'bar', targetBId, 'baz']);
  });

  it('assert :: prepare insert, connect and select relation (primary to secondary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      select: {
        id_b: true,
        value: true,
        relations: {
          id_a: true,
          value: true
        }
      },
      data: {
        id_b: sourceId,
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
        `"Q0" AS (INSERT INTO "table_b" ("id_b", "value") VALUES (:0, :1) ` +
        `RETURNING "id_b", "value"), ` +
        // First relation
        `"Q1" AS (UPDATE ONLY "table_a" AS "T" SET "relation_1_id" = "Q0"."id_b" FROM "Q0" WHERE "T"."id_a" = :2 ` +
        `RETURNING "T"."id_a", "T"."value"), ` +
        // Second relation
        `"Q2" AS (UPDATE ONLY "table_a" AS "T" SET "relation_1_id" = "Q0"."id_b" FROM "Q0" WHERE "T"."id_a" = :3 ` +
        `RETURNING "T"."id_a", "T"."value") ` +
        // Return
        `SELECT "id_b", "value", ` +
        `(SELECT COALESCE(json_agg(jsonb_build_object('id_a', "id_a", 'value', "value")), '[]'::json) ` +
        `FROM (SELECT * FROM "Q1" UNION ALL SELECT * FROM "Q2") AS "U0") AS "relations" ` +
        `FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', targetAId, targetBId]);
  });

  it('assert :: prepare insert invalid create/connect (primary to secondary)', async ({ assert }) => {
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
