import type { RepositoryRelationsWithSchema } from '@ez4/aws-aurora';
import type { Database, Query } from '@ez4/database';

import { describe, it } from 'node:test';

import { MalformedRequestError, prepareUpdateQuery } from '@ez4/aws-aurora/client';
import { ObjectSchema, SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

import { makeParameter } from './common/parameters.js';

type TestRelations = {
  indexes: never;
  filters: {};
  selects: {};
  changes: {};
};

describe('aurora query (update secondary relations)', () => {
  const prepareRelationUpdate = <T extends Database.Schema, S extends Query.SelectInput<T, TestRelations>>(
    schema: ObjectSchema,
    relations: RepositoryRelationsWithSchema,
    query: Query.UpdateManyInput<T, S, TestRelations>
  ) => {
    return prepareUpdateQuery<T, S, {}, TestRelations>('ez4-test-update-relations', schema, relations, query);
  };

  type TestSchemaOptions = {
    multiple?: boolean;
    nullish: boolean;
  };

  const getTestRelationSchema = ({ nullish, multiple }: TestSchemaOptions): ObjectSchema => {
    return {
      type: SchemaType.Object,
      properties: {
        id: {
          type: SchemaType.String,
          format: 'uuid'
        },
        foo: {
          type: SchemaType.String,
          optional: true
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

  const getSingleTestRelation = (testSchema: ObjectSchema): RepositoryRelationsWithSchema => {
    return {
      secondary_to_primary: {
        targetColumn: 'id',
        targetIndex: Index.Primary,
        sourceSchema: testSchema,
        sourceTable: 'ez4-test-relation',
        sourceAlias: 'ez4-test-relation',
        sourceColumn: 'primary_id',
        sourceIndex: Index.Secondary
      }
    };
  };

  const getMultipleTestRelation = (testSchema: ObjectSchema): RepositoryRelationsWithSchema => {
    const { secondary_to_primary } = getSingleTestRelation(testSchema);

    return {
      secondary_to_primary_1: {
        ...secondary_to_primary,
        sourceColumn: 'primary_1_id'
      },
      secondary_to_primary_2: {
        ...secondary_to_primary,
        sourceColumn: 'primary_2_id'
      },
      secondary_to_primary_3: {
        ...secondary_to_primary,
        sourceColumn: 'primary_3_id'
      }
    };
  };

  it('assert :: prepare update secondary relation (new connection)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    const [statement, variables] = await prepareRelationUpdate(testSchema, getSingleTestRelation(testSchema), {
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        secondary_to_primary: {
          primary_id: '00000000-0000-1000-9000-000000000001'
        }
      }
    });

    assert.equal(
      statement,
      // Main record
      `UPDATE ONLY "ez4-test-update-relations" SET "id" = :0, "primary_id" = :1`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', '00000000-0000-1000-9000-000000000001', 'UUID')
    ]);
  });

  it('assert :: prepare update secondary relation (empty connection)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: true
    });

    const [statement, variables] = await prepareRelationUpdate(testSchema, getSingleTestRelation(testSchema), {
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        secondary_to_primary: {
          primary_id: undefined,
          id: undefined
        }
      }
    });

    assert.equal(
      statement,
      // Main record
      `UPDATE ONLY "ez4-test-update-relations" SET "id" = :0`
    );

    assert.deepEqual(variables, [makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID')]);
  });

  it('assert :: prepare update secondary relation (select new connection)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    const [statement, variables] = await prepareRelationUpdate(testSchema, getSingleTestRelation(testSchema), {
      select: {
        id: true,
        secondary_to_primary: {
          id: true,
          foo: true
        }
      },
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        secondary_to_primary: {
          primary_id: '00000000-0000-1000-9000-000000000001'
        }
      }
    });

    assert.equal(
      statement,
      // Main record
      `UPDATE ONLY "ez4-test-update-relations" AS "R" SET "id" = :0, "primary_id" = :1 ` +
        // Select
        `RETURNING "R"."id", (SELECT COALESCE(json_agg(json_build_object('id', "T"."id", 'foo', "T"."foo")), '[]'::json) ` +
        `FROM "ez4-test-relation" AS "T" WHERE "T"."primary_id" = "R"."id") AS "secondary_to_primary"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', '00000000-0000-1000-9000-000000000001', 'UUID')
    ]);
  });

  it('assert :: prepare update secondary relation (disconnection)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: true
    });

    const [statement, variables] = await prepareRelationUpdate(testSchema, getSingleTestRelation(testSchema), {
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        secondary_to_primary: {
          primary_id: null
        }
      }
    });

    assert.equal(
      statement,
      // Main record
      `UPDATE ONLY "ez4-test-update-relations" SET "id" = :0, "primary_id" = :1`
    );

    assert.deepEqual(variables, [makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'), makeParameter('1', null)]);
  });

  it('assert :: prepare update secondary relation (active connection)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    const [statement, variables] = await prepareRelationUpdate(testSchema, getSingleTestRelation(testSchema), {
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
        `"R0" AS (UPDATE ONLY "ez4-test-update-relations" SET "id" = :0 RETURNING "id") ` +
        // Relation
        `UPDATE ONLY "ez4-test-relation" AS "T" SET "foo" = :1 FROM "R0" WHERE "T"."primary_id" = "R0"."id"`
    );

    assert.deepEqual(variables, [makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'), makeParameter('1', 'foo')]);
  });

  it('assert :: prepare update secondary relation (multiple connections and select)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      multiple: true,
      nullish: true
    });

    const [statement, variables] = await prepareRelationUpdate(testSchema, getMultipleTestRelation(testSchema), {
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
          foo: 'foo'
        },
        // Reconnect
        secondary_to_primary_2: {
          primary_2_id: '00000000-0000-1000-9000-000000000001'
        },
        secondary_to_primary_3: {
          foo: 'foo'
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"R0" AS (UPDATE ONLY "ez4-test-update-relations" AS "R" SET "id" = :0, "primary_2_id" = :1 RETURNING "R"."id"), ` +
        // First relation
        `"R1" AS (UPDATE ONLY "ez4-test-relation" AS "T" SET "foo" = :2 FROM "R0" WHERE "T"."primary_1_id" = "R0"."id"), ` +
        // Third relation
        `"R2" AS (UPDATE ONLY "ez4-test-relation" AS "T" SET "foo" = :3 FROM "R0" WHERE "T"."primary_3_id" = "R0"."id") ` +
        // Select
        `SELECT "id", (SELECT COALESCE(json_agg(json_build_object('id', "T"."id", 'foo', "T"."foo")), '[]'::json) ` +
        `FROM "ez4-test-relation" AS "T" WHERE "T"."primary_1_id" = "R0"."id") AS "secondary_to_primary_1" FROM "ez4-test-update-relations"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', '00000000-0000-1000-9000-000000000001', 'UUID'),
      makeParameter('2', 'foo'),
      makeParameter('3', 'foo')
    ]);
  });

  it('assert :: prepare update secondary relation (invalid new connection field)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    await assert.rejects(
      () =>
        prepareRelationUpdate(testSchema, getSingleTestRelation(testSchema), {
          data: {
            secondary_to_primary: {
              primary_id: '00000000-0000-1000-9000-000000000001',

              // Extra fields aren't expected when connecting relations.
              foo: 'foo'
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
        prepareRelationUpdate(testSchema, getSingleTestRelation(testSchema), {
          data: {
            secondary_to_primary: {
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
