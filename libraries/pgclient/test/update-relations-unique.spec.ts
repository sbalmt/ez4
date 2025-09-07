import type { PostgresEngine, PgRelationRepositoryWithSchema } from '@ez4/pgclient/library';
import type { Query, RelationMetadata } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';

import { describe, it } from 'node:test';

import { MalformedRequestError } from '@ez4/pgclient';
import { prepareUpdateQuery } from '@ez4/pgclient/library';
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

describe('update unique relations', () => {
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

  const prepareRelationUpdate = async <S extends Query.SelectInput<TestTableMetadata>>(
    schema: ObjectSchema,
    relations: PgRelationRepositoryWithSchema,
    query: Query.UpdateManyInput<S, TestTableMetadata>
  ) => {
    const builder = new SqlBuilder();

    const allQueries = await prepareUpdateQuery(builder, testTableName, schema, relations, query);

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

  it('assert :: prepare update unique relation (new connection)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    const [statement, variables] = await prepareRelationUpdate(testSchema, getSingleTestRelation(), {
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
      `UPDATE ONLY "ez4_test_table" SET "id" = :0, "unique_id" = :1`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000', '00000000-0000-1000-9000-000000000001']);
  });

  it('assert :: prepare update unique relation (empty connection)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: true
    });

    const [statement, variables] = await prepareRelationUpdate(testSchema, getSingleTestRelation(), {
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        unique_to_primary: {
          unique_id: undefined,
          id: undefined
        }
      }
    });

    assert.equal(
      statement,
      // Main record
      `UPDATE ONLY "ez4_test_table" SET "id" = :0`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000']);
  });

  it('assert :: prepare update unique relation (select new connection)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    const [statement, variables] = await prepareRelationUpdate(testSchema, getSingleTestRelation(), {
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
        // Select
        `"Q0" AS (SELECT (SELECT jsonb_build_object('id', "S0"."id", 'foo', "S0"."foo") FROM "ez4_test_table" AS "S0" ` +
        `WHERE "S0"."id" = "R0"."unique_id") AS "unique_to_primary" FROM "ez4_test_table" AS "R0" FOR UPDATE), ` +
        // Update
        `"Q1" AS (UPDATE ONLY "ez4_test_table" AS "U" SET "id" = :0, "unique_id" = :1 FROM "Q0") ` +
        // Return
        `SELECT "unique_to_primary" FROM "Q0"`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000', '00000000-0000-1000-9000-000000000001']);
  });

  it('assert :: prepare update unique relation (disconnection)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: true
    });

    const [statement, variables] = await prepareRelationUpdate(testSchema, getSingleTestRelation(), {
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
      `UPDATE ONLY "ez4_test_table" SET "id" = :0, "unique_id" = null`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000']);
  });

  it('assert :: prepare update unique relation (activate connection)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    const [statement, variables] = await prepareRelationUpdate(testSchema, getSingleTestRelation(), {
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        unique_to_primary: {
          foo: 'foo'
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (UPDATE ONLY "ez4_test_table" SET "id" = :0 RETURNING "unique_id") ` +
        // Relation
        `UPDATE ONLY "ez4_test_table" AS "T" SET "foo" = :1 FROM "Q0" WHERE "T"."id" = "Q0"."unique_id"`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000', 'foo']);
  });

  it('assert :: prepare update unique relation (select active connection)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    const [statement, variables] = await prepareRelationUpdate(testSchema, getSingleTestRelation(), {
      select: {
        unique_to_primary: {
          id: true,
          foo: true
        }
      },
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        unique_to_primary: {
          foo: 'foo'
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT (SELECT jsonb_build_object('id', "S0"."id", 'foo', "S0"."foo") FROM "ez4_test_table" AS "S0" ` +
        `WHERE "S0"."id" = "R0"."unique_id") AS "unique_to_primary" FROM "ez4_test_table" AS "R0" FOR UPDATE), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "ez4_test_table" AS "U" SET "id" = :0 FROM "Q0" RETURNING "U"."unique_id"), ` +
        // Relation
        `"Q2" AS (UPDATE ONLY "ez4_test_table" AS "T" SET "foo" = :1 FROM "Q1" WHERE "T"."id" = "Q1"."unique_id") ` +
        // Return
        `SELECT "unique_to_primary" FROM "Q0"`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000', 'foo']);
  });

  it('assert :: prepare update unique relation (multiple connections and select)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      multiple: true,
      nullish: true
    });

    const [statement, variables] = await prepareRelationUpdate(testSchema, getMultipleTestRelation(), {
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
          foo: 'foo'
        },
        // Reconnect
        unique_to_primary_2: {
          unique_2_id: '00000000-0000-1000-9000-000000000001'
        },
        unique_to_primary_3: {
          foo: 'foo'
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT "R0"."id", (SELECT jsonb_build_object('id', "S0"."id", 'foo', "S0"."foo") FROM "ez4_test_table" AS "S0" ` +
        `WHERE "S0"."id" = "R0"."unique_1_id") AS "unique_to_primary_1" FROM "ez4_test_table" AS "R0" FOR UPDATE), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "ez4_test_table" AS "U" SET "id" = :0, "unique_2_id" = :1 FROM "Q0" RETURNING "U"."unique_1_id", "U"."unique_3_id"), ` +
        // First relation
        `"Q2" AS (UPDATE ONLY "ez4_test_table" AS "T" SET "foo" = :2 FROM "Q1" WHERE "T"."id" = "Q1"."unique_1_id"), ` +
        // Third relation
        `"Q3" AS (UPDATE ONLY "ez4_test_table" AS "T" SET "foo" = :3 FROM "Q1" WHERE "T"."id" = "Q1"."unique_3_id") ` +
        // Return
        `SELECT "id", "unique_to_primary_1" FROM "Q0"`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000', '00000000-0000-1000-9000-000000000001', 'foo', 'foo']);
  });

  it('assert :: prepare update unique relation (invalid new connection field)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    await assert.rejects(
      () =>
        prepareRelationUpdate(testSchema, getSingleTestRelation(), {
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

  it('assert :: prepare update unique relation (invalid active connection field)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    await assert.rejects(
      () =>
        prepareRelationUpdate(testSchema, getSingleTestRelation(), {
          data: {
            unique_to_primary: {
              foo: 'foo',

              // Extra fields aren't expected on active relations.
              bar: 'bar'
            }
          }
        }),
      MalformedRequestError
    );
  });
});
