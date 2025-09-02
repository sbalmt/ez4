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

    const allQueries = await prepareUpdateQuery(testTableName, schema, relations, query, builder);

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
        targetColumn: 'id',
        targetIndex: Index.Primary,
        targetTable: testTableName,
        sourceIndex: Index.Unique,
        sourceSchema: relationSchema,
        sourceTable: testTableName,
        sourceColumn: 'unique_id'
      }
    };
  };

  const getMultipleTestRelation = (): PgRelationRepositoryWithSchema => {
    const baseRelation = {
      targetColumn: 'id',
      targetIndex: Index.Primary,
      targetTable: testTableName,
      sourceIndex: Index.Unique,
      sourceSchema: relationSchema,
      sourceTable: testTableName
    };

    return {
      [`${testTableName}.unique_to_primary_1`]: {
        targetAlias: 'unique_to_primary_1',
        sourceColumn: 'unique_1_id',
        ...baseRelation
      },
      [`${testTableName}.unique_to_primary_2`]: {
        targetAlias: 'unique_to_primary_2',
        sourceColumn: 'unique_2_id',
        ...baseRelation
      },
      [`${testTableName}.unique_to_primary_3`]: {
        targetAlias: 'unique_to_primary_3',
        sourceColumn: 'unique_3_id',
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
      // Main record
      `UPDATE ONLY "ez4_test_table" AS "R0" SET "id" = :0, "unique_id" = :1 ` +
        // Select
        `RETURNING (SELECT jsonb_build_object('id', "S0"."id", 'foo', "S0"."foo") FROM "ez4_test_table" AS "S0" ` +
        `WHERE "S0"."unique_id" = "R0"."id") AS "unique_to_primary"`
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
        `"Q0" AS (UPDATE ONLY "ez4_test_table" SET "id" = :0 RETURNING "id") ` +
        // Relation
        `UPDATE ONLY "ez4_test_table" AS "T" SET "foo" = :1 FROM "Q0" WHERE "T"."unique_id" = "Q0"."id"`
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
        // Main record
        `"Q0" AS (UPDATE ONLY "ez4_test_table" AS "R0" SET "id" = :0 RETURNING "R0"."id"), ` +
        // Relation
        `"Q1" AS (UPDATE ONLY "ez4_test_table" AS "T" SET "foo" = :1 FROM "Q0" WHERE "T"."unique_id" = "Q0"."id") ` +
        // Select
        `SELECT (SELECT jsonb_build_object('id', "S0"."id", 'foo', "S0"."foo") FROM "ez4_test_table" AS "S0" ` +
        `WHERE "S0"."unique_id" = "Q0"."id") AS "unique_to_primary" FROM "ez4_test_table"`
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
        // Main record
        `"Q0" AS (UPDATE ONLY "ez4_test_table" AS "R0" SET "id" = :0, "unique_2_id" = :1 RETURNING "R0"."id"), ` +
        // First relation
        `"Q1" AS (UPDATE ONLY "ez4_test_table" AS "T" SET "foo" = :2 FROM "Q0" WHERE "T"."unique_1_id" = "Q0"."id"), ` +
        // Third relation
        `"Q2" AS (UPDATE ONLY "ez4_test_table" AS "T" SET "foo" = :3 FROM "Q0" WHERE "T"."unique_3_id" = "Q0"."id") ` +
        // Select
        `SELECT "id", (SELECT jsonb_build_object('id', "S0"."id", 'foo', "S0"."foo") FROM "ez4_test_table" AS "S0" ` +
        `WHERE "S0"."unique_1_id" = "Q0"."id") AS "unique_to_primary_1" FROM "ez4_test_table"`
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
