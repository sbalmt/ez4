import type { PostgresEngine, RepositoryRelationsWithSchema } from '@ez4/pgclient/library';
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

describe('update primary relations', () => {
  type TestSchemaOptions = {
    multiple?: boolean;
    nullish: boolean;
  };

  const prepareRelationUpdate = <S extends Query.SelectInput<TestTableMetadata>>(
    schema: ObjectSchema,
    relations: RepositoryRelationsWithSchema,
    query: Query.UpdateManyInput<S, TestTableMetadata>
  ) => {
    const builder = new SqlBuilder();

    return prepareUpdateQuery('ez4-test-update-relations', schema, relations, query, builder);
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

  const getSingleTestRelation = (): RepositoryRelationsWithSchema => {
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

    return {
      primary_to_secondary: {
        targetColumn: 'secondary_id',
        targetIndex: Index.Secondary,
        sourceSchema: relationSchema,
        sourceTable: 'ez4-test-relation',
        sourceAlias: 'ez4-test-relation',
        sourceColumn: 'id',
        sourceIndex: Index.Primary
      }
    };
  };

  const getMultipleTestRelation = (): RepositoryRelationsWithSchema => {
    const { primary_to_secondary } = getSingleTestRelation();

    return {
      primary_to_secondary_1: {
        ...primary_to_secondary,
        targetColumn: 'secondary_1_id'
      },
      primary_to_secondary_2: {
        ...primary_to_secondary,
        targetColumn: 'secondary_2_id'
      },
      primary_to_secondary_3: {
        ...primary_to_secondary,
        targetColumn: 'secondary_3_id'
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
      `UPDATE ONLY "ez4-test-update-relations" SET "id" = :0, "secondary_id" = :1`
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
      `UPDATE ONLY "ez4-test-update-relations" SET "id" = :0`
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
      `UPDATE ONLY "ez4-test-update-relations" AS "R" SET "id" = :0, "secondary_id" = :1 ` +
        // Select
        `RETURNING (SELECT json_build_object('id', "T"."id", 'foo', "T"."foo") FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."id" = "R"."secondary_id") AS "primary_to_secondary"`
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
      `UPDATE ONLY "ez4-test-update-relations" SET "id" = :0, "secondary_id" = null`
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
        `"R0" AS (UPDATE ONLY "ez4-test-update-relations" SET "id" = :0 RETURNING "secondary_id") ` +
        // Relation
        `UPDATE ONLY "ez4-test-relation" AS "T" SET "foo" = :1 FROM "R0" WHERE "T"."id" = "R0"."secondary_id"`
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
        `"R0" AS (UPDATE ONLY "ez4-test-update-relations" AS "R" SET "id" = :0 RETURNING "R"."secondary_id"), ` +
        // Relation
        `"R1" AS (UPDATE ONLY "ez4-test-relation" AS "T" SET "foo" = :1 FROM "R0" WHERE "T"."id" = "R0"."secondary_id") ` +
        // Select
        `SELECT (SELECT json_build_object('id', "T"."id", 'foo', "T"."foo") FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."id" = "R0"."secondary_id") AS "primary_to_secondary" FROM "ez4-test-update-relations"`
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
        `"R0" AS (UPDATE ONLY "ez4-test-update-relations" AS "R" SET "id" = :0, "secondary_2_id" = :1 ` +
        `RETURNING "R"."secondary_1_id", "R"."secondary_3_id"), ` +
        // First relation
        `"R1" AS (UPDATE ONLY "ez4-test-relation" AS "T" SET "id" = :2, "foo" = :3 FROM "R0" WHERE "T"."id" = "R0"."secondary_1_id"), ` +
        // Third relation
        `"R2" AS (UPDATE ONLY "ez4-test-relation" AS "T" SET "id" = :4 FROM "R0" WHERE "T"."id" = "R0"."secondary_3_id") ` +
        // Select
        `SELECT "id", (SELECT json_build_object('id', "T"."id", 'foo', "T"."foo") FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."id" = "R0"."secondary_1_id") AS "primary_to_secondary_1" FROM "ez4-test-update-relations"`
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
