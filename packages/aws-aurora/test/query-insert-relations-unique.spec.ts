import type { RepositoryRelationsWithSchema } from '@ez4/aws-aurora';
import type { Query, RelationMetadata } from '@ez4/database';
import type { PostgresEngine } from '@ez4/aws-aurora/client';

import { describe, it } from 'node:test';

import { MalformedRequestError, prepareInsertQuery } from '@ez4/aws-aurora/client';
import { ObjectSchema, SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

import { makeParameter } from './common/parameters.js';

type TestTableMetadata = {
  engine: PostgresEngine;
  relations: RelationMetadata;
  indexes: {};
  schema: {};
};

describe('aurora query (insert unique relations)', () => {
  type TestSchemaOptions = {
    multiple?: boolean;
    nullish: boolean;
  };

  const prepareRelationInsert = <S extends Query.SelectInput<TestTableMetadata>>(
    schema: ObjectSchema,
    relations: RepositoryRelationsWithSchema,
    query: Query.InsertOneInput<S, TestTableMetadata>
  ) => {
    return prepareInsertQuery<TestTableMetadata, S>('ez4-test-insert-relations', schema, relations, query);
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
      unique_to_primary: {
        targetColumn: 'id',
        targetIndex: Index.Primary,
        sourceSchema: relationSchema,
        sourceTable: 'ez4-test-relation',
        sourceAlias: 'ez4-test-relation',
        sourceColumn: 'unique_id',
        sourceIndex: Index.Unique
      }
    };
  };

  const getMultipleTestRelation = (): RepositoryRelationsWithSchema => {
    const { unique_to_primary } = getSingleTestRelation();

    return {
      unique_to_primary_1: {
        ...unique_to_primary,
        sourceColumn: 'unique_1_id'
      },
      unique_to_primary_2: {
        ...unique_to_primary,
        sourceColumn: 'unique_2_id'
      },
      unique_to_primary_3: {
        ...unique_to_primary,
        sourceColumn: 'unique_3_id'
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
          unique_id: '00000000-0000-1000-9000-000000000001'
        }
      }
    });

    assert.equal(
      statement,
      // Main record
      `INSERT INTO "ez4-test-insert-relations" ("id", "unique_id") VALUES (:0, :1)`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', '00000000-0000-1000-9000-000000000001', 'UUID')
    ]);
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
      `INSERT INTO "ez4-test-insert-relations" ("id", "unique_id") VALUES (:0, :1)`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', '00000000-0000-1000-9000-000000000001', 'UUID')
    ]);
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
      `INSERT INTO "ez4-test-insert-relations" ("id") VALUES (:0)`
    );

    assert.deepEqual(variables, [makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID')]);
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
        `"R0" AS (INSERT INTO "ez4-test-insert-relations" ("id", "unique_id") VALUES (:0, :1) RETURNING "id") ` +
        // Select
        `SELECT ` +
        `(SELECT json_build_object('id', "T"."id", 'foo', "T"."foo") FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."unique_id" = "R0"."id") AS "unique_to_primary" ` +
        `FROM "R0"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', '00000000-0000-1000-9000-000000000001', 'UUID')
    ]);
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
        `"R0" AS (INSERT INTO "ez4-test-insert-relations" ("id") VALUES (:0) RETURNING "id") ` +
        // Relation
        `INSERT INTO "ez4-test-relation" ("id", "foo", "unique_id") ` +
        `SELECT :1, :2, "R0"."id" FROM "R0"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', '00000000-0000-1000-9000-000000000001', 'UUID'),
      makeParameter('2', 'foo')
    ]);
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
      `INSERT INTO "ez4-test-insert-relations" ("id") VALUES (:0)`
    );

    assert.deepEqual(variables, [makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID')]);
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
        `"R0" AS (INSERT INTO "ez4-test-insert-relations" ("id") VALUES (:0) RETURNING "id", "bar"), ` +
        // Main record
        `"R1" AS (INSERT INTO "ez4-test-relation" ("id", "foo", "unique_id") SELECT :1, :2, "R0"."id" FROM "R0" RETURNING "id", "foo") ` +
        // Select
        `SELECT "bar", (SELECT json_build_object('id', "id", 'foo', "foo") FROM "R1") AS "unique_to_primary" FROM "R0"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', '00000000-0000-1000-9000-000000000001', 'UUID'),
      makeParameter('2', 'foo')
    ]);
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
        // Main record
        `"R0" AS (INSERT INTO "ez4-test-insert-relations" ("id", "unique_2_id") VALUES (:0, :1) RETURNING "id"), ` +
        // First relation
        `"R1" AS (INSERT INTO "ez4-test-relation" ("id", "foo", "unique_1_id") SELECT :2, :3, "R0"."id" FROM "R0" RETURNING "id", "foo"), ` +
        // Third relation
        `"R2" AS (INSERT INTO "ez4-test-relation" ("id", "unique_3_id") SELECT :4, "R0"."id" FROM "R0") ` +
        // Select
        `SELECT "id", (SELECT json_build_object('id', "id", 'foo', "foo") FROM "R1") AS "unique_to_primary_1" FROM "R0"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', '00000000-0000-1000-9000-000000000002', 'UUID'),
      makeParameter('2', '00000000-0000-1000-9000-000000000001', 'UUID'),
      makeParameter('3', 'foo'),
      makeParameter('4', '00000000-0000-1000-9000-000000000003', 'UUID')
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
