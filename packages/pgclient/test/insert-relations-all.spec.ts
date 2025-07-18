import type { PostgresEngine, RepositoryRelationsWithSchema } from '@ez4/pgclient/library';
import type { Query, RelationMetadata } from '@ez4/database';

import { describe, it } from 'node:test';

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

describe('insert relations', () => {
  const testSchema: ObjectSchema = {
    type: SchemaType.Object,
    properties: {
      id: {
        type: SchemaType.String,
        format: 'uuid'
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

  const prepareInsert = <S extends Query.SelectInput<TestTableMetadata>>(query: Query.InsertOneInput<S, TestTableMetadata>) => {
    const builder = new SqlBuilder();

    return prepareInsertQuery('ez4-test-insert-relations', testSchema, testRelations, query, builder);
  };

  it('assert :: prepare insert relations (create primary, unique and secondary)', async ({ assert }) => {
    const [statement, variables] = await prepareInsert({
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        primary_to_secondary: {
          id: '00000000-0000-1000-9000-000000000001'
        },
        unique_to_primary: {
          id: '00000000-0000-1000-9000-000000000002'
        },
        secondary_to_primary: [
          {
            id: '00000000-0000-1000-9000-000000000003'
          }
        ]
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // First relation (primary)
        `"R0" AS (INSERT INTO "ez4-test-relation" ("id") VALUES (:0) RETURNING "id"), ` +
        // Main record
        `"R1" AS (INSERT INTO "ez4-test-insert-relations" ("id", "secondary_id") SELECT :1, "R0"."id" FROM "R0" RETURNING "id"), ` +
        // Second relation (unique)
        `"R2" AS (INSERT INTO "ez4-test-relation" ("id", "unique_id") SELECT :2, "R1"."id" FROM "R1") ` +
        // Third relation (inverse)
        `INSERT INTO "ez4-test-relation" ("id", "primary_id") SELECT :3, "R1"."id" FROM "R1"`
    );

    assert.deepEqual(variables, [
      '00000000-0000-1000-9000-000000000001',
      '00000000-0000-1000-9000-000000000000',
      '00000000-0000-1000-9000-000000000002',
      '00000000-0000-1000-9000-000000000003'
    ]);
  });

  it('assert :: prepare insert relations (create primary, unique and secondary with select)', async ({ assert }) => {
    const [statement, variables] = await prepareInsert({
      select: {
        id: true,
        primary_to_secondary: {
          id: true
        },
        unique_to_primary: {
          id: true
        },
        secondary_to_primary: {
          id: true
        }
      },
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        primary_to_secondary: {
          id: '00000000-0000-1000-9000-000000000001'
        },
        unique_to_primary: {
          id: '00000000-0000-1000-9000-000000000002'
        },
        secondary_to_primary: [
          {
            id: '00000000-0000-1000-9000-000000000003'
          }
        ]
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // First relation (primary)
        `"R0" AS (INSERT INTO "ez4-test-relation" ("id") VALUES (:0) RETURNING "id"), ` +
        // Main record
        `"R1" AS (INSERT INTO "ez4-test-insert-relations" ("id", "secondary_id") SELECT :1, "R0"."id" FROM "R0" RETURNING "id"), ` +
        // Second relation (unique)
        `"R2" AS (INSERT INTO "ez4-test-relation" ("id", "unique_id") SELECT :2, "R1"."id" FROM "R1" RETURNING "id"), ` +
        // Third relation (inverse)
        `"R3" AS (INSERT INTO "ez4-test-relation" ("id", "primary_id") SELECT :3, "R1"."id" FROM "R1" RETURNING "id") ` +
        // Select
        `SELECT "id", ` +
        `(SELECT json_build_object('id', "id") FROM "R0") AS "primary_to_secondary", ` +
        `(SELECT json_build_object('id', "id") FROM "R2") AS "unique_to_primary", ` +
        `(SELECT COALESCE(json_agg(json_build_object('id', "id")), '[]'::json) FROM "R3") AS "secondary_to_primary" ` +
        `FROM "R1"`
    );

    assert.deepEqual(variables, [
      '00000000-0000-1000-9000-000000000001',
      '00000000-0000-1000-9000-000000000000',
      '00000000-0000-1000-9000-000000000002',
      '00000000-0000-1000-9000-000000000003'
    ]);
  });
});
