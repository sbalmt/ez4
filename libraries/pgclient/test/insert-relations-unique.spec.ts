import type { PostgresEngine, PgRelationRepositoryWithSchema } from '@ez4/pgclient/library';
import type { Query, RelationMetadata } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';

import { describe, it } from 'node:test';

import { MalformedRequestError } from '@ez4/pgclient';
import { prepareInsertQuery } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';
import { SqlBuilder } from '@ez4/pgsql';
import { Index } from '@ez4/database';

type TestTableMetadata = {
  engine: PostgresEngine;
  relations: RelationMetadata;
  indexes: {};
  schema: {};
};

type TestSchemaOptions = {
  multiple?: boolean;
  nullish: boolean;
};

describe('insert unique relations', () => {
  const testTableName = 'ez4_test_table';

  const relationSchema: ObjectSchema = {
    type: SchemaType.Object,
    properties: {
      id: {
        type: SchemaType.String,
        format: 'uuid'
      },
      foo: {
        type: SchemaType.String,
        optional: true
      }
    }
  };

  const prepareRelationInsert = async <S extends Query.SelectInput<TestTableMetadata>>(
    schema: ObjectSchema,
    relations: PgRelationRepositoryWithSchema,
    query: Query.InsertOneInput<S, TestTableMetadata>
  ) => {
    const builder = new SqlBuilder();

    const allQueries = await prepareInsertQuery(builder, testTableName, schema, relations, query);

    return builder.with(allQueries).build();
  };

  const getTestRelationSchema = ({ nullish, multiple }: TestSchemaOptions): ObjectSchema => {
    return {
      type: SchemaType.Object,
      properties: {
        id: {
          type: SchemaType.String,
          format: 'uuid'
        },
        bar: {
          type: SchemaType.Number,
          optional: true,
          nullable: true
        },
        ...(multiple
          ? {
              unique_1_id: {
                type: SchemaType.String,
                optional: nullish,
                nullable: nullish,
                format: 'uuid'
              },
              unique_2_id: {
                type: SchemaType.String,
                optional: nullish,
                nullable: nullish,
                format: 'uuid'
              },
              unique_3_id: {
                type: SchemaType.String,
                optional: nullish,
                nullable: nullish,
                format: 'uuid'
              }
            }
          : {
              unique_id: {
                type: SchemaType.String,
                optional: nullish,
                nullable: nullish,
                format: 'uuid'
              }
            })
      }
    };
  };

  const getSingleTestRelation = (): PgRelationRepositoryWithSchema => {
    return {
      [`${testTableName}.unique_to_primary`]: {
        targetAlias: 'unique_to_primary',
        targetColumn: 'unique_id',
        targetIndex: Index.Unique,
        targetTable: testTableName,
        sourceIndex: Index.Primary,
        sourceSchema: relationSchema,
        sourceTable: testTableName,
        sourceColumn: 'id'
      }
    };
  };

  const getMultipleTestRelation = (): PgRelationRepositoryWithSchema => {
    const baseRelation = {
      targetIndex: Index.Unique,
      targetTable: testTableName,
      sourceIndex: Index.Primary,
      sourceSchema: relationSchema,
      sourceTable: testTableName,
      sourceColumn: 'id'
    };

    return {
      [`${testTableName}.unique_to_primary_1`]: {
        targetAlias: 'unique_to_primary_1',
        targetColumn: 'unique_1_id',
        ...baseRelation
      },
      [`${testTableName}.unique_to_primary_2`]: {
        targetAlias: 'unique_to_primary_2',
        targetColumn: 'unique_2_id',
        ...baseRelation
      },
      [`${testTableName}.unique_to_primary_3`]: {
        targetAlias: 'unique_to_primary_3',
        targetColumn: 'unique_3_id',
        ...baseRelation
      }
    };
  };

  it('assert :: prepare insert unique relation (optional connection)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: true
    });

    const [statement, variables] = await prepareRelationInsert(testSchema, getSingleTestRelation(), {
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        unique_to_primary: {
          unique_id: null
        }
      }
    });

    assert.equal(
      statement,
      // Main record
      `INSERT INTO "ez4_test_table" ("id", "unique_id") VALUES (:0, null)`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000']);
  });

  it('assert :: prepare insert unique relation (required connection)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    const [statement, variables] = await prepareRelationInsert(testSchema, getSingleTestRelation(), {
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        unique_to_primary: {
          unique_id: '00000000-0000-1000-9000-000000000001'
        }
      }
    });

    assert.equal(
      statement,
      // Main record
      `INSERT INTO "ez4_test_table" ("id", "unique_id") VALUES (:0, :1)`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000', '00000000-0000-1000-9000-000000000001']);
  });

  it('assert :: prepare insert unique relation (empty connection)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: true
    });

    const [statement, variables] = await prepareRelationInsert(testSchema, getSingleTestRelation(), {
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        unique_to_primary: {
          unique_id: undefined
        }
      }
    });

    assert.equal(
      statement,
      // Main record
      `INSERT INTO "ez4_test_table" ("id") VALUES (:0)`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000']);
  });

  it('assert :: prepare insert unique relation (select connection)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    const [statement, variables] = await prepareRelationInsert(testSchema, getSingleTestRelation(), {
      select: {
        unique_to_primary: {
          id: true,
          foo: true
        }
      },
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        unique_to_primary: {
          unique_id: '00000000-0000-1000-9000-000000000001'
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (INSERT INTO "ez4_test_table" ("id", "unique_id") VALUES (:0, :1) RETURNING "unique_id") ` +
        // Select
        `SELECT ` +
        `(SELECT jsonb_build_object('id', "S0"."id", 'foo', "S0"."foo") FROM "ez4_test_table" AS "S0" ` +
        `WHERE "S0"."id" = "unique_id") AS "unique_to_primary" ` +
        `FROM "Q0"`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000', '00000000-0000-1000-9000-000000000001']);
  });

  it('assert :: prepare insert unique relation (required creation)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    const [statement, variables] = await prepareRelationInsert(testSchema, getSingleTestRelation(), {
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        unique_to_primary: {
          id: '00000000-0000-1000-9000-000000000001',
          foo: 'foo'
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (INSERT INTO "ez4_test_table" ("id", "foo") VALUES (:0, :1) RETURNING "id") ` +
        // Relation
        `INSERT INTO "ez4_test_table" ("id", "unique_id") ` +
        `SELECT :2, "Q0"."id" FROM "Q0"`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000001', 'foo', '00000000-0000-1000-9000-000000000000']);
  });

  it('assert :: prepare insert unique relation (empty creation)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: true
    });

    const [statement, variables] = await prepareRelationInsert(testSchema, getSingleTestRelation(), {
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        unique_to_primary: {}
      }
    });

    assert.equal(
      statement,
      // Main record
      `INSERT INTO "ez4_test_table" ("id") VALUES (:0)`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000']);
  });

  it('assert :: prepare insert unique relation (select creation)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    const [statement, variables] = await prepareRelationInsert(testSchema, getSingleTestRelation(), {
      select: {
        bar: true,
        unique_to_primary: {
          id: true,
          foo: true
        }
      },
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        unique_to_primary: {
          id: '00000000-0000-1000-9000-000000000001',
          foo: 'foo'
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Relation
        `"Q0" AS (INSERT INTO "ez4_test_table" ("id", "foo") VALUES (:0, :1) RETURNING "id", "foo"), ` +
        // Main record
        `"Q1" AS (INSERT INTO "ez4_test_table" ("id", "unique_id") SELECT :2, "Q0"."id" FROM "Q0" RETURNING "bar") ` +
        // Select
        `SELECT "bar", (SELECT jsonb_build_object('id', "id", 'foo', "foo") FROM "Q0") AS "unique_to_primary" FROM "Q1"`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000001', 'foo', '00000000-0000-1000-9000-000000000000']);
  });

  it('assert :: prepare insert unique relation (connection, creation and select)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      multiple: true,
      nullish: true
    });

    const [statement, variables] = await prepareRelationInsert(testSchema, getMultipleTestRelation(), {
      select: {
        id: true,
        unique_to_primary_1: {
          id: true,
          foo: true
        }
      },
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        unique_to_primary_1: {
          id: '00000000-0000-1000-9000-000000000001',
          foo: 'foo'
        },
        unique_to_primary_2: {
          unique_2_id: '00000000-0000-1000-9000-000000000002'
        },
        unique_to_primary_3: {
          id: '00000000-0000-1000-9000-000000000003'
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // First relation
        `"Q0" AS (INSERT INTO "ez4_test_table" ("id", "foo") VALUES (:0, :1) RETURNING "id", "foo"), ` +
        // Second relation
        `"Q1" AS (INSERT INTO "ez4_test_table" ("id") VALUES (:2) RETURNING "id"), ` +
        // Main record
        `"Q2" AS (INSERT INTO "ez4_test_table" ("id", "unique_1_id", "unique_2_id", "unique_3_id") ` +
        `SELECT :3, "Q0"."id", :4, "Q1"."id" FROM "Q0", "Q1" RETURNING "id") ` +
        // Select
        `SELECT "id", (SELECT jsonb_build_object('id', "id", 'foo', "foo") FROM "Q0") AS "unique_to_primary_1" FROM "Q2"`
    );

    assert.deepEqual(variables, [
      '00000000-0000-1000-9000-000000000001',
      'foo',
      '00000000-0000-1000-9000-000000000003',
      '00000000-0000-1000-9000-000000000000',
      '00000000-0000-1000-9000-000000000002'
    ]);
  });

  it('assert :: prepare insert unique relation (invalid connection field)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    await assert.rejects(
      () =>
        prepareRelationInsert(testSchema, getSingleTestRelation(), {
          data: {
            unique_to_primary: {
              unique_id: '00000000-0000-1000-9000-000000000001',

              // Extra fields aren't expected when connecting relations.
              foo: 'foo'
            }
          }
        }),
      MalformedRequestError
    );
  });

  it('assert :: prepare insert unique relation (invalid creation field)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    await assert.rejects(
      () =>
        prepareRelationInsert(testSchema, getSingleTestRelation(), {
          data: {
            unique_to_primary: {
              foo: 'foo',

              // Extra fields aren't expected when creating relations.
              bar: 'bar'
            }
          }
        }),
      MalformedRequestError
    );
  });
});
