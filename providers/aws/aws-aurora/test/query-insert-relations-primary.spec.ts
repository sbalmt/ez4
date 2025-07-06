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

describe('aurora query (insert primary relations)', () => {
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
      `INSERT INTO "ez4-test-insert-relations" ("id", "secondary_id") VALUES (:0, :1)`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', '00000000-0000-1000-9000-000000000001', 'UUID')
    ]);
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
      `INSERT INTO "ez4-test-insert-relations" ("id", "secondary_id") VALUES (:0, :1)`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', '00000000-0000-1000-9000-000000000001', 'UUID')
    ]);
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
      `INSERT INTO "ez4-test-insert-relations" ("id") VALUES (:0)`
    );

    assert.deepEqual(variables, [makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID')]);
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
        `"R0" AS (INSERT INTO "ez4-test-insert-relations" ("id", "secondary_id") VALUES (:0, :1) RETURNING "secondary_id") ` +
        // Select
        `SELECT ` +
        `(SELECT json_build_object('id', "T"."id", 'foo', "T"."foo") FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."id" = "R0"."secondary_id") AS "primary_to_secondary" ` +
        `FROM "R0"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', '00000000-0000-1000-9000-000000000001', 'UUID')
    ]);
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
        `"R0" AS (INSERT INTO "ez4-test-relation" ("id", "foo") VALUES (:0, :1) RETURNING "id") ` +
        // Main record
        `INSERT INTO "ez4-test-insert-relations" ("id", "secondary_id") SELECT :2, "R0"."id" FROM "R0"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000001', 'UUID'),
      makeParameter('1', 'foo'),
      makeParameter('2', '00000000-0000-1000-9000-000000000000', 'UUID')
    ]);
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
      `INSERT INTO "ez4-test-insert-relations" ("id") VALUES (:0)`
    );

    assert.deepEqual(variables, [makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID')]);
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
        `"R0" AS (INSERT INTO "ez4-test-relation" ("id", "foo") VALUES (:0, :1) RETURNING "id", "foo"), ` +
        // Relation
        `"R1" AS (INSERT INTO "ez4-test-insert-relations" ("id", "secondary_id") SELECT :2, "R0"."id" FROM "R0" RETURNING "bar") ` +
        // Select
        `SELECT "bar", (SELECT json_build_object('id', "id", 'foo', "foo") FROM "R0") AS "primary_to_secondary" FROM "R1"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000001', 'UUID'),
      makeParameter('1', 'foo'),
      makeParameter('2', '00000000-0000-1000-9000-000000000000', 'UUID')
    ]);
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
        `"R0" AS (INSERT INTO "ez4-test-relation" ("id", "foo") VALUES (:0, :1) RETURNING "id", "foo"), ` +
        // Third relation
        `"R1" AS (INSERT INTO "ez4-test-relation" ("id") VALUES (:2) RETURNING "id"), ` +
        // Main record
        `"R2" AS (INSERT INTO "ez4-test-insert-relations" ("id", "secondary_1_id", "secondary_2_id", "secondary_3_id") ` +
        `SELECT :3, "R0"."id", :4, "R1"."id" FROM "R0", "R1" RETURNING "id") ` +
        // Select
        `SELECT "id", (SELECT json_build_object('id', "id", 'foo', "foo") FROM "R0") AS "primary_to_secondary_1" FROM "R2"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000001', 'UUID'),
      makeParameter('1', 'foo'),
      makeParameter('2', '00000000-0000-1000-9000-000000000003', 'UUID'),
      makeParameter('3', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('4', '00000000-0000-1000-9000-000000000002', 'UUID')
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
