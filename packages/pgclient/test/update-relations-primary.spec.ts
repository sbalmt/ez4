import type { PostgresEngine, PgRelationRepositoryWithSchema } from '@ez4/pgclient/library';
import type { Query, RelationMetadata } from '@ez4/database';

import { describe, it } from 'node:test';

import { MalformedRequestError } from '@ez4/pgclient';
import { prepareUpdateQuery } from '@ez4/pgclient/library';
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

describe('update primary relations', () => {
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

  const prepareRelationUpdate = <S extends Query.SelectInput<TestTableMetadata>>(
    schema: ObjectSchema,
    relations: PgRelationRepositoryWithSchema,
    query: Query.UpdateManyInput<S, TestTableMetadata>
  ) => {
    const builder = new SqlBuilder();

    return prepareUpdateQuery(testTableName, schema, relations, query, builder);
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

  const getSingleTestRelation = (): PgRelationRepositoryWithSchema => {
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

  const getMultipleTestRelation = (): PgRelationRepositoryWithSchema => {
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

  it('assert :: prepare update primary relation (new connection)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    const [statement, variables] = await prepareRelationUpdate(testSchema, getSingleTestRelation(), {
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
      `UPDATE ONLY "ez4_test_table" SET "id" = :0, "secondary_id" = :1`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000', '00000000-0000-1000-9000-000000000001']);
  });

  it('assert :: prepare update primary relation (empty connection)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: true
    });

    const [statement, variables] = await prepareRelationUpdate(testSchema, getSingleTestRelation(), {
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        primary_to_secondary: {
          secondary_id: undefined,
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

  it('assert :: prepare update primary relation (select new connection)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    const [statement, variables] = await prepareRelationUpdate(testSchema, getSingleTestRelation(), {
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
      // Main record
      `UPDATE ONLY "ez4_test_table" AS "R0" SET "id" = :0, "secondary_id" = :1 ` +
        // Select
        `RETURNING (SELECT jsonb_build_object('id', "S0"."id", 'foo', "S0"."foo") FROM "ez4_test_table" AS "S0" ` +
        `WHERE "S0"."id" = "R0"."secondary_id") AS "primary_to_secondary"`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000', '00000000-0000-1000-9000-000000000001']);
  });

  it('assert :: prepare update primary relation (disconnection)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: true
    });

    const [statement, variables] = await prepareRelationUpdate(testSchema, getSingleTestRelation(), {
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        primary_to_secondary: {
          secondary_id: null
        }
      }
    });

    assert.equal(
      statement,
      // Main record
      `UPDATE ONLY "ez4_test_table" SET "id" = :0, "secondary_id" = null`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000']);
  });

  it('assert :: prepare update primary relation (activate connection)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    const [statement, variables] = await prepareRelationUpdate(testSchema, getSingleTestRelation(), {
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        primary_to_secondary: {
          foo: 'foo'
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (UPDATE ONLY "ez4_test_table" SET "id" = :0 RETURNING "secondary_id") ` +
        // Relation
        `UPDATE ONLY "ez4_test_table" AS "T" SET "foo" = :1 FROM "Q0" WHERE "T"."id" = "Q0"."secondary_id"`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000', 'foo']);
  });

  it('assert :: prepare update primary relation (select active connection)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    const [statement, variables] = await prepareRelationUpdate(testSchema, getSingleTestRelation(), {
      select: {
        primary_to_secondary: {
          id: true,
          foo: true
        }
      },
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        primary_to_secondary: {
          foo: 'foo'
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (UPDATE ONLY "ez4_test_table" AS "R0" SET "id" = :0 RETURNING "R0"."secondary_id"), ` +
        // Relation
        `"Q1" AS (UPDATE ONLY "ez4_test_table" AS "T" SET "foo" = :1 FROM "Q0" WHERE "T"."id" = "Q0"."secondary_id") ` +
        // Select
        `SELECT (SELECT jsonb_build_object('id', "S0"."id", 'foo', "S0"."foo") FROM "ez4_test_table" AS "S0" ` +
        `WHERE "S0"."id" = "Q0"."secondary_id") AS "primary_to_secondary" FROM "ez4_test_table"`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000', 'foo']);
  });

  it('assert :: prepare update primary relation (multiple connections and select)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      multiple: true,
      nullish: true
    });

    const [statement, variables] = await prepareRelationUpdate(testSchema, getMultipleTestRelation(), {
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
        // Reconnect
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
        // Main record
        `"Q0" AS (UPDATE ONLY "ez4_test_table" AS "R0" SET "id" = :0, "secondary_2_id" = :1 ` +
        `RETURNING "R0"."secondary_1_id", "R0"."secondary_3_id"), ` +
        // First relation
        `"Q1" AS (UPDATE ONLY "ez4_test_table" AS "T" SET "id" = :2, "foo" = :3 FROM "Q0" WHERE "T"."id" = "Q0"."secondary_1_id"), ` +
        // Third relation
        `"Q2" AS (UPDATE ONLY "ez4_test_table" AS "T" SET "id" = :4 FROM "Q0" WHERE "T"."id" = "Q0"."secondary_3_id") ` +
        // Select
        `SELECT "id", (SELECT jsonb_build_object('id', "S0"."id", 'foo', "S0"."foo") FROM "ez4_test_table" AS "S0" ` +
        `WHERE "S0"."id" = "Q0"."secondary_1_id") AS "primary_to_secondary_1" FROM "ez4_test_table"`
    );

    assert.deepEqual(variables, [
      '00000000-0000-1000-9000-000000000000',
      '00000000-0000-1000-9000-000000000002',
      '00000000-0000-1000-9000-000000000001',
      'foo',
      '00000000-0000-1000-9000-000000000003'
    ]);
  });

  it('assert :: prepare update primary relation (invalid new connection field)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    await assert.rejects(
      () =>
        prepareRelationUpdate(testSchema, getSingleTestRelation(), {
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

  it('assert :: prepare update primary relation (invalid active connection field)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    await assert.rejects(
      () =>
        prepareRelationUpdate(testSchema, getSingleTestRelation(), {
          data: {
            primary_to_secondary: {
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
