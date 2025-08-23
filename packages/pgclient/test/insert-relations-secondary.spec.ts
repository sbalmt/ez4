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

describe('insert secondary relations', () => {
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
    return {
      [`${testTableName}.secondary_to_primary`]: {
        targetAlias: 'secondary_to_primary',
        targetColumn: 'id',
        targetIndex: Index.Primary,
        sourceIndex: Index.Secondary,
        sourceSchema: relationSchema,
        sourceTable: testTableName,
        sourceColumn: 'primary_id'
      }
    };
  };

  const getMultipleTestRelation = (): RepositoryRelationsWithSchema => {
    const baseRelation = {
      targetColumn: 'id',
      targetIndex: Index.Primary,
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
        `"R0" AS (INSERT INTO "ez4_test_table" ("id") VALUES (:0) RETURNING "id") ` +
        // Relation
        `INSERT INTO "ez4_test_table" ("id", "primary_id") SELECT :1, "R0"."id" FROM "R0"`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000', '00000000-0000-1000-9000-000000000001']);
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
        `"R0" AS (INSERT INTO "ez4_test_table" ("id") VALUES (:0) RETURNING "id") ` +
        // Relation
        `INSERT INTO "ez4_test_table" ("id", "foo", "primary_id") SELECT :1, :2, "R0"."id" FROM "R0"`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000', '00000000-0000-1000-9000-000000000001', 'foo']);
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

    assert.equal(statement, `INSERT INTO "ez4_test_table" ("id") VALUES (:0)`);

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000']);
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
        `"R0" AS (INSERT INTO "ez4_test_table" ("id") VALUES (:0) RETURNING "id"), ` +
        // Relation
        `"R1" AS (INSERT INTO "ez4_test_table" ("id", "foo", "primary_id") SELECT :1, :2, "R0"."id" FROM "R0" RETURNING "id", "foo") ` +
        // Select
        `SELECT ` +
        `(SELECT COALESCE(json_agg(json_build_object('id', "id", 'foo', "foo")), '[]'::json) FROM "R1") AS "secondary_to_primary" ` +
        `FROM "R0"`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000', '00000000-0000-1000-9000-000000000001', 'foo']);
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
        `"R0" AS (INSERT INTO "ez4_test_table" ("id") VALUES (:0) RETURNING "id"), ` +
        // First relation
        `"R1" AS (INSERT INTO "ez4_test_table" ("id", "foo", "primary_1_id") SELECT :1, :2, "R0"."id" FROM "R0" RETURNING "id", "foo"), ` +
        // Second relation
        `"R2" AS (INSERT INTO "ez4_test_table" ("id", "primary_1_id") SELECT :3, "R0"."id" FROM "R0" RETURNING "id", "foo"), ` +
        // Third relation
        `"R3" AS (INSERT INTO "ez4_test_table" ("id", "primary_2_id") SELECT :4, "R0"."id" FROM "R0") ` +
        // Select
        `SELECT "id", ` +
        `(SELECT COALESCE(json_agg(json_build_object('id', "id", 'foo', "foo")), '[]'::json) FROM "R1", "R2") AS "secondary_to_primary_1" ` +
        `FROM "R0"`
    );

    assert.deepEqual(variables, [
      '00000000-0000-1000-9000-000000000000',
      '00000000-0000-1000-9000-000000000001',
      'foo',
      '00000000-0000-1000-9000-000000000002',
      '00000000-0000-1000-9000-000000000003'
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
