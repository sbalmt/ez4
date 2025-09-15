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

describe('insert secondary relations', () => {
  const tableName = 'table_a';

  const sourceId = '00000000-0000-1000-9000-000000000000';
  const targetId = '00000000-0000-1000-9000-000000000001';
  const uniqueId = '00000000-0000-1000-9000-000000000002';

  const prepareRelationInsert = async <S extends Query.SelectInput<TestTableMetadata>>(
    query: Query.InsertOneInput<S, TestTableMetadata>
  ) => {
    const repository = TestRelationRepository[tableName];
    const relations = getRelationsWithSchema(tableName, TestRelationRepository);
    const builder = new SqlBuilder();

    const allQueries = await prepareInsertQuery(builder, tableName, repository.schema, relations, query);

    return builder.with(allQueries).build();
  };

  it('assert :: prepare empty relation (secondary to primary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      select: {
        id_a: true,
        value: true,
        relation_1: {
          id_b: true,
          value: true
        }
      },
      data: {
        id_a: sourceId,
        value: 'foo',
        relation_1: {}
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (INSERT INTO "table_a" ("id_a", "value") VALUES (:0, :1) ` +
        `RETURNING "id_a", "value", "relation_1_id") ` +
        // Return
        `SELECT "id_a", "value", ` +
        `(SELECT jsonb_build_object('id_b', "S0"."id_b", 'value', "S0"."value") ` +
        `FROM "table_b" AS "S0" WHERE "S0"."id_b" = "relation_1_id") AS "relation_1" ` +
        `FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo']);
  });

  it('assert :: prepare undefined relation (secondary to primary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      select: {
        id_a: true,
        value: true,
        relation_1: {
          id_b: true,
          value: true
        }
      },
      data: {
        id_a: sourceId,
        value: 'foo',
        relation_1: {
          id_b: undefined
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (INSERT INTO "table_a" ("id_a", "value") VALUES (:0, :1) ` +
        `RETURNING "id_a", "value", "relation_1_id") ` +
        // Return
        `SELECT "id_a", "value", ` +
        `(SELECT jsonb_build_object('id_b', "S0"."id_b", 'value', "S0"."value") ` +
        `FROM "table_b" AS "S0" WHERE "S0"."id_b" = "relation_1_id") AS "relation_1" ` +
        `FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo']);
  });

  it('assert :: prepare null relation (secondary to primary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      select: {
        id_a: true,
        value: true,
        relation_1: {
          id_b: true,
          value: true
        }
      },
      data: {
        id_a: sourceId,
        value: 'foo',
        relation_1: {
          id_b: null
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (INSERT INTO "table_a" ("id_a", "value") VALUES (:0, :1) ` +
        `RETURNING "id_a", "value", "relation_1_id") ` +
        // Return
        `SELECT "id_a", "value", ` +
        `(SELECT jsonb_build_object('id_b', "S0"."id_b", 'value', "S0"."value") ` +
        `FROM "table_b" AS "S0" WHERE "S0"."id_b" = "relation_1_id") AS "relation_1" ` +
        `FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo']);
  });

  it('assert :: prepare insert and create relation (secondary to primary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      data: {
        id_a: sourceId,
        value: 'foo',
        relation_1: {
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
        `INSERT INTO "table_a" ("id_a", "value", "relation_1_id") SELECT :2, :3, "Q0"."id_b" FROM "Q0"`
    );

    assert.deepEqual(variables, [targetId, 'bar', sourceId, 'foo']);
  });

  it('assert :: prepare insert, create and select relation (secondary to primary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      select: {
        id_a: true,
        value: true,
        relation_1: {
          id_b: true,
          value: true
        }
      },
      data: {
        id_a: sourceId,
        value: 'foo',
        relation_1: {
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
        `"Q1" AS (INSERT INTO "table_a" ("id_a", "value", "relation_1_id") SELECT :2, :3, "Q0"."id_b" FROM "Q0" ` +
        `RETURNING "id_a", "value") ` +
        // Return
        `SELECT "id_a", "value", ` +
        `(SELECT jsonb_build_object('id_b', "id_b", 'value', "value") ` +
        `FROM "Q0") AS "relation_1" ` +
        `FROM "Q1"`
    );

    assert.deepEqual(variables, [targetId, 'bar', sourceId, 'foo']);
  });

  it('assert :: prepare insert, connect and select relation (secondary to primary)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      select: {
        id_a: true,
        value: true,
        relation_1: {
          id_b: true,
          value: true
        }
      },
      data: {
        id_a: sourceId,
        value: 'foo',
        relation_1: {
          id_b: targetId
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (INSERT INTO "table_a" ("id_a", "value", "relation_1_id") VALUES (:0, :1, :2) ` +
        `RETURNING "id_a", "value", "relation_1_id") ` +
        // Return
        `SELECT "id_a", "value", ` +
        `(SELECT jsonb_build_object('id_b', "S0"."id_b", 'value', "S0"."value") ` +
        `FROM "table_b" AS "S0" WHERE "S0"."id_b" = "relation_1_id") AS "relation_1" ` +
        `FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', targetId]);
  });

  it('assert :: prepare insert invalid create/connect (secondary to primary)', async ({ assert }) => {
    await assert.rejects(
      () =>
        prepareRelationInsert({
          data: {
            id_a: sourceId,
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
    const [statement, variables] = await prepareRelationInsert({
      select: {
        id_a: true,
        value: true,
        relation_2: {
          id_c: true,
          value: true
        }
      },
      data: {
        id_a: sourceId,
        value: 'foo',
        relation_2: {}
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (INSERT INTO "table_a" ("id_a", "value") VALUES (:0, :1) ` +
        `RETURNING "id_a", "value", "relation_2_id") ` +
        // Return
        `SELECT "id_a", "value", ` +
        `(SELECT jsonb_build_object('id_c', "S0"."id_c", 'value', "S0"."value") ` +
        `FROM "table_c" AS "S0" WHERE "S0"."unique_2_id" = "relation_2_id") AS "relation_2" ` +
        `FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo']);
  });

  it('assert :: prepare undefined relation (secondary to unique)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      select: {
        id_a: true,
        value: true,
        relation_2: {
          id_c: true,
          value: true
        }
      },
      data: {
        id_a: sourceId,
        value: 'foo',
        relation_2: {
          unique_2_id: undefined
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (INSERT INTO "table_a" ("id_a", "value") VALUES (:0, :1) ` +
        `RETURNING "id_a", "value", "relation_2_id") ` +
        // Return
        `SELECT "id_a", "value", ` +
        `(SELECT jsonb_build_object('id_c', "S0"."id_c", 'value', "S0"."value") ` +
        `FROM "table_c" AS "S0" WHERE "S0"."unique_2_id" = "relation_2_id") AS "relation_2" ` +
        `FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo']);
  });

  it('assert :: prepare null relation (secondary to unique)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      select: {
        id_a: true,
        value: true,
        relation_2: {
          id_c: true,
          value: true
        }
      },
      data: {
        id_a: sourceId,
        value: 'foo',
        relation_2: {
          unique_2_id: null
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (INSERT INTO "table_a" ("id_a", "value") VALUES (:0, :1) ` +
        `RETURNING "id_a", "value", "relation_2_id") ` +
        // Return
        `SELECT "id_a", "value", ` +
        `(SELECT jsonb_build_object('id_c', "S0"."id_c", 'value', "S0"."value") ` +
        `FROM "table_c" AS "S0" WHERE "S0"."unique_2_id" = "relation_2_id") AS "relation_2" ` +
        `FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo']);
  });

  it('assert :: prepare insert and create relation (secondary to unique)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      data: {
        id_a: sourceId,
        value: 'foo',
        relation_2: {
          id_c: targetId,
          unique_2_id: uniqueId,
          value: 'bar'
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Relation record
        `"Q0" AS (INSERT INTO "table_c" ("id_c", "unique_2_id", "value") VALUES (:0, :1, :2) ` +
        `RETURNING "unique_2_id") ` +
        // Main record
        `INSERT INTO "table_a" ("id_a", "value", "relation_2_id") SELECT :3, :4, "Q0"."unique_2_id" FROM "Q0"`
    );

    assert.deepEqual(variables, [targetId, uniqueId, 'bar', sourceId, 'foo']);
  });

  it('assert :: prepare insert, create and select relation (secondary to unique)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      select: {
        id_a: true,
        value: true,
        relation_2: {
          id_c: true,
          value: true
        }
      },
      data: {
        id_a: sourceId,
        value: 'foo',
        relation_2: {
          id_c: targetId,
          unique_2_id: uniqueId,
          value: 'bar'
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Relation record
        `"Q0" AS (INSERT INTO "table_c" ("id_c", "unique_2_id", "value") VALUES (:0, :1, :2) ` +
        `RETURNING "unique_2_id", "id_c", "value"), ` +
        // Main record
        `"Q1" AS (INSERT INTO "table_a" ("id_a", "value", "relation_2_id") SELECT :3, :4, "Q0"."unique_2_id" FROM "Q0" ` +
        `RETURNING "id_a", "value") ` +
        // Return
        `SELECT "id_a", "value", ` +
        `(SELECT jsonb_build_object('id_c', "id_c", 'value', "value") ` +
        `FROM "Q0") AS "relation_2" ` +
        `FROM "Q1"`
    );

    assert.deepEqual(variables, [targetId, uniqueId, 'bar', sourceId, 'foo']);
  });

  it('assert :: prepare insert, connect and select relation (secondary to unique)', async ({ assert }) => {
    const [statement, variables] = await prepareRelationInsert({
      select: {
        id_a: true,
        value: true,
        relation_2: {
          id_c: true,
          value: true
        }
      },
      data: {
        id_a: sourceId,
        value: 'foo',
        relation_2: {
          unique_2_id: targetId
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (INSERT INTO "table_a" ("id_a", "value", "relation_2_id") VALUES (:0, :1, :2) ` +
        `RETURNING "id_a", "value", "relation_2_id") ` +
        // Return
        `SELECT "id_a", "value", ` +
        `(SELECT jsonb_build_object('id_c', "S0"."id_c", 'value', "S0"."value") ` +
        `FROM "table_c" AS "S0" WHERE "S0"."unique_2_id" = "relation_2_id") AS "relation_2" ` +
        `FROM "Q0"`
    );

    assert.deepEqual(variables, [sourceId, 'foo', targetId]);
  });

  it('assert :: prepare insert invalid create/connect (secondary to unique)', async ({ assert }) => {
    await assert.rejects(
      () =>
        prepareRelationInsert({
          data: {
            id_a: sourceId,
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
