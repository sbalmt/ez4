import type { PostgresEngine, RepositoryRelationsWithSchema } from '@ez4/pgclient/library';
import type { Query, RelationMetadata } from '@ez4/database';

import { describe, it } from 'node:test';

import { MalformedRequestError } from '@ez4/pgclient';
import { prepareInsertQuery } from '@ez4/pgclient/library';
import { ObjectSchema, SchemaType } from '@ez4/schema';
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

describe('insert primary relations', () => {
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

  const prepareRelationInsert = <S extends Query.SelectInput<TestTableMetadata>>(
    schema: ObjectSchema,
    relations: RepositoryRelationsWithSchema,
    query: Query.InsertOneInput<S, TestTableMetadata>
  ) => {
    const builder = new SqlBuilder();

    return prepareInsertQuery(testTableName, schema, relations, query, builder);
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
              secondary_1_id: {
                type: SchemaType.String,
                optional: nullish,
                nullable: nullish,
                format: 'uuid'
              },
              secondary_2_id: {
                type: SchemaType.String,
                optional: nullish,
                nullable: nullish,
                format: 'uuid'
              },
              secondary_3_id: {
                type: SchemaType.String,
                optional: nullish,
                nullable: nullish,
                format: 'uuid'
              }
            }
          : {
              secondary_id: {
                type: SchemaType.String,
                optional: nullish,
                nullable: nullish,
                format: 'uuid'
              }
            })
      }
    };
  };

  const getSingleTestRelation = (): RepositoryRelationsWithSchema => {
    return {
      [`${testTableName}.primary_to_secondary`]: {
        targetAlias: 'primary_to_secondary',
        targetColumn: 'secondary_id',
        targetIndex: Index.Secondary,
        targetTable: testTableName,
        sourceIndex: Index.Primary,
        sourceSchema: relationSchema,
        sourceTable: testTableName,
        sourceColumn: 'id'
      }
    };
  };

  const getMultipleTestRelation = (): RepositoryRelationsWithSchema => {
    const baseRelation = {
      targetIndex: Index.Secondary,
      targetTable: testTableName,
      sourceIndex: Index.Primary,
      sourceSchema: relationSchema,
      sourceTable: testTableName,
      sourceColumn: 'id'
    };

    return {
      [`${testTableName}.primary_to_secondary_1`]: {
        targetAlias: 'primary_to_secondary_1',
        targetColumn: 'secondary_1_id',
        ...baseRelation
      },
      [`${testTableName}.primary_to_secondary_2`]: {
        targetAlias: 'primary_to_secondary_2',
        targetColumn: 'secondary_2_id',
        ...baseRelation
      },
      [`${testTableName}.primary_to_secondary_3`]: {
        targetAlias: 'primary_to_secondary_3',
        targetColumn: 'secondary_3_id',
        ...baseRelation
      }
    };
  };

  it('assert :: prepare insert primary relation (optional connection)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: true
    });

    const [statement, variables] = await prepareRelationInsert(testSchema, getSingleTestRelation(), {
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        primary_to_secondary: {
          secondary_id: '00000000-0000-1000-9000-000000000001'
        }
      }
    });

    assert.equal(
      statement,
      // Main record
      `INSERT INTO "ez4_test_table" ("id", "secondary_id") VALUES (:0, :1)`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000', '00000000-0000-1000-9000-000000000001']);
  });

  it('assert :: prepare insert primary relation (required connection)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    const [statement, variables] = await prepareRelationInsert(testSchema, getSingleTestRelation(), {
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        primary_to_secondary: {
          secondary_id: '00000000-0000-1000-9000-000000000001'
        }
      }
    });

    assert.equal(
      statement,
      // Main record
      `INSERT INTO "ez4_test_table" ("id", "secondary_id") VALUES (:0, :1)`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000', '00000000-0000-1000-9000-000000000001']);
  });

  it('assert :: prepare insert primary relation (empty connection)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: true
    });

    const [statement, variables] = await prepareRelationInsert(testSchema, getSingleTestRelation(), {
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        primary_to_secondary: {
          secondary_id: undefined
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

  it('assert :: prepare insert primary relation (select connection)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    const [statement, variables] = await prepareRelationInsert(testSchema, getSingleTestRelation(), {
      select: {
        primary_to_secondary: {
          id: true,
          foo: true
        }
      },
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        primary_to_secondary: {
          secondary_id: '00000000-0000-1000-9000-000000000001'
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (INSERT INTO "ez4_test_table" ("id", "secondary_id") VALUES (:0, :1) RETURNING "secondary_id") ` +
        // Select
        `SELECT ` +
        `(SELECT jsonb_build_object('id', "S0"."id", 'foo', "S0"."foo") FROM "ez4_test_table" AS "S0" ` +
        `WHERE "S0"."id" = "Q0"."secondary_id") AS "primary_to_secondary" ` +
        `FROM "Q0"`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000', '00000000-0000-1000-9000-000000000001']);
  });

  it('assert :: prepare insert primary relation (required creation)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    const [statement, variables] = await prepareRelationInsert(testSchema, getSingleTestRelation(), {
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        primary_to_secondary: {
          id: '00000000-0000-1000-9000-000000000001',
          foo: 'foo'
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Relation
        `"Q0" AS (INSERT INTO "ez4_test_table" ("id", "foo") VALUES (:0, :1) RETURNING "id") ` +
        // Main record
        `INSERT INTO "ez4_test_table" ("id", "secondary_id") SELECT :2, "Q0"."id" FROM "Q0"`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000001', 'foo', '00000000-0000-1000-9000-000000000000']);
  });

  it('assert :: prepare insert primary relation (empty creation)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: true
    });

    const [statement, variables] = await prepareRelationInsert(testSchema, getSingleTestRelation(), {
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        primary_to_secondary: {}
      }
    });

    assert.equal(
      statement,
      // Main record
      `INSERT INTO "ez4_test_table" ("id") VALUES (:0)`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000']);
  });

  it('assert :: prepare insert primary relation (select creation)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    const [statement, variables] = await prepareRelationInsert(testSchema, getSingleTestRelation(), {
      select: {
        bar: true,
        primary_to_secondary: {
          id: true,
          foo: true
        }
      },
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        primary_to_secondary: {
          id: '00000000-0000-1000-9000-000000000001',
          foo: 'foo'
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (INSERT INTO "ez4_test_table" ("id", "foo") VALUES (:0, :1) RETURNING "id", "foo"), ` +
        // Relation
        `"Q1" AS (INSERT INTO "ez4_test_table" ("id", "secondary_id") SELECT :2, "Q0"."id" FROM "Q0" RETURNING "bar") ` +
        // Select
        `SELECT "bar", (SELECT jsonb_build_object('id', "id", 'foo', "foo") FROM "Q0") AS "primary_to_secondary" FROM "Q1"`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000001', 'foo', '00000000-0000-1000-9000-000000000000']);
  });

  it('assert :: prepare insert primary relation (connection, creation and select)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      multiple: true,
      nullish: true
    });

    const [statement, variables] = await prepareRelationInsert(testSchema, getMultipleTestRelation(), {
      select: {
        id: true,
        primary_to_secondary_1: {
          id: true,
          foo: true
        }
      },
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        primary_to_secondary_1: {
          id: '00000000-0000-1000-9000-000000000001',
          foo: 'foo'
        },
        primary_to_secondary_2: {
          secondary_2_id: '00000000-0000-1000-9000-000000000002'
        },
        primary_to_secondary_3: {
          id: '00000000-0000-1000-9000-000000000003'
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // First relation
        `"Q0" AS (INSERT INTO "ez4_test_table" ("id", "foo") VALUES (:0, :1) RETURNING "id", "foo"), ` +
        // Third relation
        `"Q1" AS (INSERT INTO "ez4_test_table" ("id") VALUES (:2) RETURNING "id"), ` +
        // Main record
        `"Q2" AS (INSERT INTO "ez4_test_table" ("id", "secondary_1_id", "secondary_2_id", "secondary_3_id") ` +
        `SELECT :3, "Q0"."id", :4, "Q1"."id" FROM "Q0", "Q1" RETURNING "id") ` +
        // Select
        `SELECT "id", (SELECT jsonb_build_object('id', "id", 'foo', "foo") FROM "Q0") AS "primary_to_secondary_1" FROM "Q2"`
    );

    assert.deepEqual(variables, [
      '00000000-0000-1000-9000-000000000001',
      'foo',
      '00000000-0000-1000-9000-000000000003',
      '00000000-0000-1000-9000-000000000000',
      '00000000-0000-1000-9000-000000000002'
    ]);
  });

  it('assert :: prepare insert primary relation (invalid connection field)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    await assert.rejects(
      () =>
        prepareRelationInsert(testSchema, getSingleTestRelation(), {
          data: {
            primary_to_secondary: {
              secondary_id: '00000000-0000-1000-9000-000000000001',

              // Extra fields aren't expected when connecting relations.
              foo: 'foo'
            }
          }
        }),
      MalformedRequestError
    );
  });

  it('assert :: prepare insert primary relation (invalid creation field)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    await assert.rejects(
      () =>
        prepareRelationInsert(testSchema, getSingleTestRelation(), {
          data: {
            primary_to_secondary: {
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
