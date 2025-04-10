import type { RepositoryRelationsWithSchema } from '@ez4/aws-aurora';
import type { Database, Query } from '@ez4/database';

import { describe, it } from 'node:test';

import { prepareUpdateQuery } from '@ez4/aws-aurora/client';
import { ObjectSchema, SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

import { makeParameter } from './common/parameters.js';

type TestRelations = {
  indexes: never;
  filters: {};
  selects: {};
  changes: {};
};

describe('aurora query (update relations)', () => {
  const testSchema: ObjectSchema = {
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
      primary_id: {
        type: SchemaType.String,
        optional: true,
        format: 'uuid'
      },
      unique_id: {
        type: SchemaType.String,
        optional: true,
        format: 'uuid'
      },
      secondary_id: {
        type: SchemaType.String,
        optional: true,
        format: 'uuid'
      }
    }
  };

  const testRelations: RepositoryRelationsWithSchema = {
    primary_to_secondary: {
      targetColumn: 'secondary_id',
      targetIndex: Index.Secondary,
      sourceSchema: testSchema,
      sourceTable: 'ez4-test-relation',
      sourceAlias: 'ez4-test-relation',
      sourceColumn: 'id',
      sourceIndex: Index.Primary
    },
    unique_to_primary: {
      targetColumn: 'id',
      targetIndex: Index.Primary,
      sourceSchema: testSchema,
      sourceTable: 'ez4-test-relation',
      sourceAlias: 'ez4-test-relation',
      sourceColumn: 'unique_id',
      sourceIndex: Index.Unique
    },
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

  const prepareUpdate = <T extends Database.Schema, S extends Query.SelectInput<T, TestRelations>>(
    query: Query.UpdateManyInput<T, S, TestRelations>
  ) => {
    return prepareUpdateQuery<T, S, {}, TestRelations>('ez4-test-update-relations', testSchema, testRelations, query);
  };

  it('assert :: prepare update relations (active connections)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      data: {
        primary_to_secondary: {
          foo: 'foo1'
        },
        unique_to_primary: {
          foo: 'foo2'
        },
        secondary_to_primary: {
          foo: 'foo3'
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"R0" AS (SELECT "secondary_id", "id" FROM "ez4-test-update-relations"), ` +
        // First relation
        `"R1" AS (UPDATE ONLY "ez4-test-relation" AS "T" SET "foo" = :0 FROM "R0" WHERE "T"."id" = "R0"."secondary_id"), ` +
        // Second relation
        `"R2" AS (UPDATE ONLY "ez4-test-relation" AS "T" SET "foo" = :1 FROM "R0" WHERE "T"."unique_id" = "R0"."id") ` +
        // Third relation
        `UPDATE ONLY "ez4-test-relation" AS "T" SET "foo" = :2 FROM "R0" WHERE "T"."primary_id" = "R0"."id"`
    );

    assert.deepEqual(variables, [makeParameter('0', 'foo1'), makeParameter('1', 'foo2'), makeParameter('2', 'foo3')]);
  });

  it('assert :: prepare update relations (active connections with select)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      select: {
        id: true,
        primary_to_secondary: {
          foo: true
        },
        unique_to_primary: {
          id: true
        },
        secondary_to_primary: {
          foo: true
        }
      },
      data: {
        primary_to_secondary: {
          foo: 'foo1'
        },
        unique_to_primary: {
          foo: 'foo2'
        },
        secondary_to_primary: {
          foo: 'foo3'
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"R0" AS (SELECT "R"."secondary_id", "R"."id" FROM "ez4-test-update-relations" AS "R"), ` +
        // First relation
        `"R1" AS (UPDATE ONLY "ez4-test-relation" AS "T" SET "foo" = :0 FROM "R0" WHERE "T"."id" = "R0"."secondary_id"), ` +
        // Second relation
        `"R2" AS (UPDATE ONLY "ez4-test-relation" AS "T" SET "foo" = :1 FROM "R0" WHERE "T"."unique_id" = "R0"."id"), ` +
        // Third relation
        `"R3" AS (UPDATE ONLY "ez4-test-relation" AS "T" SET "foo" = :2 FROM "R0" WHERE "T"."primary_id" = "R0"."id") ` +
        // Select
        `SELECT "id", ` +
        `(SELECT json_build_object('foo', "T"."foo") FROM "ez4-test-relation" AS "T" WHERE "T"."id" = "R0"."secondary_id") AS "primary_to_secondary", ` +
        `(SELECT json_build_object('id', "T"."id") FROM "ez4-test-relation" AS "T" WHERE "T"."unique_id" = "R0"."id") AS "unique_to_primary", ` +
        `(SELECT COALESCE(json_agg(json_build_object('foo', "T"."foo")), '[]'::json) FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."primary_id" = "R0"."id") AS "secondary_to_primary" ` +
        `FROM "ez4-test-update-relations"`
    );

    assert.deepEqual(variables, [makeParameter('0', 'foo1'), makeParameter('1', 'foo2'), makeParameter('2', 'foo3')]);
  });
});
