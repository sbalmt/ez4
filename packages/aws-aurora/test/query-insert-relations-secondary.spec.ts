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

describe('aurora query (insert secondary relations)', () => {
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
      secondary_to_primary: {
        targetColumn: 'id',
        targetIndex: Index.Primary,
        sourceSchema: relationSchema,
        sourceTable: 'ez4-test-relation',
        sourceAlias: 'ez4-test-relation',
        sourceColumn: 'primary_id',
        sourceIndex: Index.Secondary
      }
    };
  };

  const getMultipleTestRelation = (): RepositoryRelationsWithSchema => {
    const { secondary_to_primary } = getSingleTestRelation();

    return {
      secondary_to_primary_1: {
        ...secondary_to_primary,
        sourceColumn: 'primary_1_id'
      },
      secondary_to_primary_2: {
        ...secondary_to_primary,
        sourceColumn: 'primary_2_id'
      }
    };
  };

  it('assert :: prepare insert secondary relation (optional creation)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: true
    });

    const [statement, variables] = await prepareRelationInsert(testSchema, getSingleTestRelation(), {
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        secondary_to_primary: [
          {
            id: '00000000-0000-1000-9000-000000000001'
          }
        ]
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"R0" AS (INSERT INTO "ez4-test-insert-relations" ("id") VALUES (:0) RETURNING "id") ` +
        // Relation
        `INSERT INTO "ez4-test-relation" ("id", "primary_id") SELECT :1, "R0"."id" FROM "R0"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', '00000000-0000-1000-9000-000000000001', 'UUID')
    ]);
  });

  it('assert :: prepare insert secondary relation (required creation)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    const [statement, variables] = await prepareRelationInsert(testSchema, getSingleTestRelation(), {
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        secondary_to_primary: [
          {
            id: '00000000-0000-1000-9000-000000000001',
            foo: 'foo'
          }
        ]
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"R0" AS (INSERT INTO "ez4-test-insert-relations" ("id") VALUES (:0) RETURNING "id") ` +
        // Relation
        `INSERT INTO "ez4-test-relation" ("id", "foo", "primary_id") SELECT :1, :2, "R0"."id" FROM "R0"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', '00000000-0000-1000-9000-000000000001', 'UUID'),
      makeParameter('2', 'foo')
    ]);
  });

  it('assert :: prepare insert secondary relation (empty creation)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    const [statement, variables] = await prepareRelationInsert(testSchema, getSingleTestRelation(), {
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        secondary_to_primary: [{}, {}]
      }
    });

    assert.equal(statement, `INSERT INTO "ez4-test-insert-relations" ("id") VALUES (:0)`);

    assert.deepEqual(variables, [makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID')]);
  });

  it('assert :: prepare insert secondary relation (select creation)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    const [statement, variables] = await prepareRelationInsert(testSchema, getSingleTestRelation(), {
      select: {
        secondary_to_primary: {
          id: true,
          foo: true
        }
      },
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        secondary_to_primary: [
          {
            id: '00000000-0000-1000-9000-000000000001',
            foo: 'foo'
          }
        ]
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"R0" AS (INSERT INTO "ez4-test-insert-relations" ("id") VALUES (:0) RETURNING "id"), ` +
        // Relation
        `"R1" AS (INSERT INTO "ez4-test-relation" ("id", "foo", "primary_id") SELECT :1, :2, "R0"."id" FROM "R0" RETURNING "id", "foo") ` +
        // Select
        `SELECT ` +
        `(SELECT COALESCE(json_agg(json_build_object('id', "id", 'foo', "foo")), '[]'::json) FROM "R1") AS "secondary_to_primary" ` +
        `FROM "R0"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', '00000000-0000-1000-9000-000000000001', 'UUID'),
      makeParameter('2', 'foo')
    ]);
  });

  it('assert :: prepare insert secondary relation (multiple creation and select)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      multiple: true,
      nullish: true
    });

    const [statement, variables] = await prepareRelationInsert(testSchema, getMultipleTestRelation(), {
      select: {
        id: true,
        secondary_to_primary_1: {
          id: true,
          foo: true
        }
      },
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        secondary_to_primary_1: [
          {
            id: '00000000-0000-1000-9000-000000000001',
            foo: 'foo'
          },
          {
            id: '00000000-0000-1000-9000-000000000002'
          }
        ],
        secondary_to_primary_2: [
          {
            id: '00000000-0000-1000-9000-000000000003'
          }
        ]
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"R0" AS (INSERT INTO "ez4-test-insert-relations" ("id") VALUES (:0) RETURNING "id"), ` +
        // First relation
        `"R1" AS (INSERT INTO "ez4-test-relation" ("id", "foo", "primary_1_id") SELECT :1, :2, "R0"."id" FROM "R0" RETURNING "id", "foo"), ` +
        // Second relation
        `"R2" AS (INSERT INTO "ez4-test-relation" ("id", "primary_1_id") SELECT :3, "R0"."id" FROM "R0" RETURNING "id", "foo"), ` +
        // Third relation
        `"R3" AS (INSERT INTO "ez4-test-relation" ("id", "primary_2_id") SELECT :4, "R0"."id" FROM "R0") ` +
        // Select
        `SELECT "id", ` +
        `(SELECT COALESCE(json_agg(json_build_object('id', "id", 'foo', "foo")), '[]'::json) FROM "R1", "R2") AS "secondary_to_primary_1" ` +
        `FROM "R0"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', '00000000-0000-1000-9000-000000000001', 'UUID'),
      makeParameter('2', 'foo'),
      makeParameter('3', '00000000-0000-1000-9000-000000000002', 'UUID'),
      makeParameter('4', '00000000-0000-1000-9000-000000000003', 'UUID')
    ]);
  });

  it('assert :: prepare insert secondary relation (invalid creation field)', async ({ assert }) => {
    const testSchema = getTestRelationSchema({
      nullish: false
    });

    await assert.rejects(
      () =>
        prepareRelationInsert(testSchema, getSingleTestRelation(), {
          data: {
            secondary_to_primary: [
              {
                foo: 'foo',

                // Extra fields aren't expected when creating relations.
                bar: 'bar'
              }
            ]
          }
        }),
      MalformedRequestError
    );
  });
});
