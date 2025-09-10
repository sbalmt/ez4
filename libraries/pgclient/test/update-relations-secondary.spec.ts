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

describe('update secondary relations', () => {
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
              primary_1_id: {
                type: SchemaType.String,
                optional: nullish,
                nullable: nullish,
                format: 'uuid'
              },
              primary_2_id: {
                type: SchemaType.String,
                optional: nullish,
                nullable: nullish,
                format: 'uuid'
              }
            }
          : {
              primary_id: {
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
      [`${testTableName}.secondary_to_primary`]: {
        primaryColumn: 'id',
        targetAlias: 'secondary_to_primary',
        targetColumn: 'id',
        targetIndex: Index.Primary,
        targetTable: testTableName,
        sourceIndex: Index.Secondary,
        sourceSchema: relationSchema,
        sourceTable: testTableName,
        sourceColumn: 'primary_id'
      }
    };
  };

  const getMultipleTestRelation = (): PgRelationRepositoryWithSchema => {
    const baseRelation = {
      primaryColumn: 'id',
      targetColumn: 'id',
      targetIndex: Index.Primary,
      targetTable: testTableName,
      sourceIndex: Index.Secondary,
      sourceSchema: relationSchema,
      sourceTable: testTableName
    };

    return {
      [`${testTableName}.secondary_to_primary_1`]: {
        targetAlias: 'secondary_to_primary_1',
        sourceColumn: 'primary_1_id',
        ...baseRelation
      },
      [`${testTableName}.secondary_to_primary_2`]: {
        targetAlias: 'secondary_to_primary_2',
        sourceColumn: 'primary_2_id',
        ...baseRelation
      },
      [`${testTableName}.secondary_to_primary_3`]: {
        targetAlias: 'secondary_to_primary_3',
        sourceColumn: 'primary_3_id',
        ...baseRelation
      }
    };
  };

  it('assert :: prepare update secondary relation (new connection)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    const [statement, variables] = await prepareRelationUpdate(testSchema, getSingleTestRelation(), {
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        secondary_to_primary: {
          id: '00000000-0000-1000-9000-000000000001'
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (UPDATE ONLY "ez4_test_table" SET "id" = :0 RETURNING "id") ` +
        // Relation
        `UPDATE ONLY "ez4_test_table" AS "T" SET "primary_id" = "Q0"."id" FROM "Q0" WHERE "T"."id" = :1`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000', '00000000-0000-1000-9000-000000000001']);
  });

  it('assert :: prepare update secondary relation (empty connection)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: true
    });

    const [statement, variables] = await prepareRelationUpdate(testSchema, getSingleTestRelation(), {
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        secondary_to_primary: {
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

  it('assert :: prepare update secondary relation (select new connection)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    const [statement, variables] = await prepareRelationUpdate(testSchema, getSingleTestRelation(), {
      select: {
        secondary_to_primary: {
          id: true,
          foo: true
        }
      },
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        secondary_to_primary: {
          id: '00000000-0000-1000-9000-000000000001'
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT (SELECT COALESCE(json_agg(jsonb_build_object('id', "S0"."id", 'foo', "S0"."foo")), '[]'::json) ` +
        `FROM "ez4_test_table" AS "S0" WHERE "S0"."primary_id" = "R0"."id") AS "secondary_to_primary" ` +
        `FROM "ez4_test_table" AS "R0" FOR UPDATE), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "ez4_test_table" AS "U" SET "id" = :0 FROM "Q0" RETURNING "U"."id"), ` +
        // First relation
        `"Q2" AS (UPDATE ONLY "ez4_test_table" AS "T" SET "primary_id" = "Q1"."id" FROM "Q1" WHERE "T"."id" = :1) ` +
        // Return
        `SELECT "secondary_to_primary" FROM "Q0"`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000', '00000000-0000-1000-9000-000000000001']);
  });

  it('assert :: prepare update secondary relation (disconnection)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: true
    });

    const [statement, variables] = await prepareRelationUpdate(testSchema, getSingleTestRelation(), {
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        secondary_to_primary: {
          id: null
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"Q0" AS (UPDATE ONLY "ez4_test_table" SET "id" = :0 RETURNING "id") ` +
        // First relation
        `UPDATE ONLY "ez4_test_table" AS "T" SET "primary_id" = null FROM "Q0" WHERE "T"."primary_id" = "Q0"."id"`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000']);
  });

  it('assert :: prepare update secondary relation (activate connection)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    const [statement, variables] = await prepareRelationUpdate(testSchema, getSingleTestRelation(), {
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        secondary_to_primary: {
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
        `UPDATE ONLY "ez4_test_table" AS "T" SET "foo" = :1 FROM "Q0" WHERE "T"."primary_id" = "Q0"."id"`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000', 'foo']);
  });

  it('assert :: prepare update secondary relation (multiple connections and select)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      multiple: true,
      nullish: true
    });

    const [statement, variables] = await prepareRelationUpdate(testSchema, getMultipleTestRelation(), {
      select: {
        id: true,
        secondary_to_primary_1: {
          id: true,
          foo: true
        }
      },
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        secondary_to_primary_1: {
          foo: 'foo-1'
        },
        // Reconnect
        secondary_to_primary_2: {
          id: '00000000-0000-1000-9000-000000000001'
        },
        secondary_to_primary_3: {
          foo: 'foo-2'
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT "R0"."id", (SELECT COALESCE(json_agg(jsonb_build_object('id', "S0"."id", 'foo', "S0"."foo")), '[]'::json) ` +
        `FROM "ez4_test_table" AS "S0" WHERE "S0"."primary_1_id" = "R0"."id") AS "secondary_to_primary_1" FROM "ez4_test_table" AS "R0" FOR UPDATE), ` +
        // Main record
        `"Q1" AS (UPDATE ONLY "ez4_test_table" AS "U" SET "id" = :0 FROM "Q0" RETURNING "U"."id"), ` +
        // First relation
        `"Q2" AS (UPDATE ONLY "ez4_test_table" AS "T" SET "foo" = :1 FROM "Q1" WHERE "T"."primary_1_id" = "Q1"."id"), ` +
        // Second relation
        `"Q3" AS (UPDATE ONLY "ez4_test_table" AS "T" SET "primary_2_id" = "Q1"."id" FROM "Q1" WHERE "T"."id" = :2), ` +
        // Third relation
        `"Q4" AS (UPDATE ONLY "ez4_test_table" AS "T" SET "foo" = :3 FROM "Q1" WHERE "T"."primary_3_id" = "Q1"."id") ` +
        // Return
        `SELECT "id", "secondary_to_primary_1" FROM "Q0"`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000', 'foo-1', '00000000-0000-1000-9000-000000000001', 'foo-2']);
  });

  it('assert :: prepare update secondary relation (invalid new connection field)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    await assert.rejects(
      () =>
        prepareRelationUpdate(testSchema, getSingleTestRelation(), {
          data: {
            secondary_to_primary: {
              id: '00000000-0000-1000-9000-000000000001',

              // Extra fields aren't expected when connecting relations.
              extra: 'foo'
            }
          }
        }),
      MalformedRequestError
    );
  });

  it('assert :: prepare update secondary relation (invalid active connection field)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    await assert.rejects(
      () =>
        prepareRelationUpdate(testSchema, getSingleTestRelation(), {
          data: {
            secondary_to_primary: {
              foo: 'foo',

              // Extra fields aren't expected on active relations.
              extra: 'bar'
            }
          }
        }),
      MalformedRequestError
    );
  });
});
