import type { PostgresEngine, RepositoryRelationsWithSchema } from '@ez4/pgclient/library';
import type { Query, RelationMetadata } from '@ez4/database';

import { describe, it } from 'node:test';

import { prepareUpdateQuery } from '@ez4/pgclient/library';
import { ObjectSchema, SchemaType } from '@ez4/schema';
import { SqlBuilder } from '@ez4/pgsql';
import { Index } from '@ez4/database';

type TestTableMetadata = {
  engine: PostgresEngine;
  relations: RelationMetadata;
  schema: {};
  indexes: {
    id: Index.Primary;
  };
};

describe('update relations', () => {
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

  const prepareUpdate = <S extends Query.SelectInput<TestTableMetadata>>(
    query: Query.UpdateManyInput<S, TestTableMetadata> | Query.UpdateOneInput<S, TestTableMetadata>
  ) => {
    const builder = new SqlBuilder();

    return prepareUpdateQuery('ez4-test-update-relations', testSchema, testRelations, query, builder);
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

    assert.deepEqual(variables, ['foo1', 'foo2', 'foo3']);
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

    assert.deepEqual(variables, ['foo1', 'foo2', 'foo3']);
  });

  it('assert :: prepare update relations (with where include)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      select: {
        id: true,
        primary_to_secondary: {
          id: true
        },
        unique_to_primary: {
          foo: true
        },
        secondary_to_primary: {
          foo: true
        }
      },
      include: {
        primary_to_secondary: {
          where: {
            foo: 123
          }
        },
        unique_to_primary: {
          where: {
            foo: 456
          }
        },
        secondary_to_primary: {
          where: {
            foo: 789
          }
        }
      } as any,
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
      },
      where: {
        id: '00000000-0000-1000-9000-000000000000'
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"R0" AS (SELECT "R"."secondary_id", "R"."id" FROM "ez4-test-update-relations" AS "R" WHERE "R"."id" = :0), ` +
        // First relation
        `"R1" AS (UPDATE ONLY "ez4-test-relation" AS "T" SET "foo" = :1 FROM "R0" WHERE "T"."id" = "R0"."secondary_id"), ` +
        // Second relation
        `"R2" AS (UPDATE ONLY "ez4-test-relation" AS "T" SET "foo" = :2 FROM "R0" WHERE "T"."unique_id" = "R0"."id"), ` +
        // Third relation
        `"R3" AS (UPDATE ONLY "ez4-test-relation" AS "T" SET "foo" = :3 FROM "R0" WHERE "T"."primary_id" = "R0"."id") ` +
        // Select
        `SELECT "id", ` +
        `(SELECT json_build_object('id', "T"."id") FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."foo" = :4 AND "T"."id" = "R0"."secondary_id") AS "primary_to_secondary", ` +
        `(SELECT json_build_object('foo', "T"."foo") FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."foo" = :5 AND "T"."unique_id" = "R0"."id") AS "unique_to_primary", ` +
        `(SELECT COALESCE(json_agg(json_build_object('foo', "T"."foo")), '[]'::json) FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."foo" = :6 AND "T"."primary_id" = "R0"."id") AS "secondary_to_primary" ` +
        `FROM "ez4-test-update-relations"`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000', 'foo1', 'foo2', 'foo3', 123, 456, 789]);
  });
});
