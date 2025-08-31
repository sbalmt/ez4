import type { PostgresEngine } from '@ez4/pgclient/library';
import type { Query, RelationMetadata } from '@ez4/database';

import { describe, it } from 'node:test';

import { getRelationsWithSchema, getTableRepository, prepareUpdateQuery } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';
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
  const testTableName = 'ez4_test_table';

  const repository = getTableRepository([
    {
      name: testTableName,
      indexes: [],
      relations: [
        {
          targetAlias: 'primary_to_secondary',
          targetColumn: 'secondary_id',
          targetIndex: Index.Secondary,
          sourceIndex: Index.Primary,
          sourceTable: testTableName,
          sourceColumn: 'id'
        },
        {
          targetAlias: 'unique_to_primary',
          targetColumn: 'id',
          targetIndex: Index.Primary,
          sourceIndex: Index.Unique,
          sourceTable: testTableName,
          sourceColumn: 'unique_id'
        },
        {
          targetAlias: 'secondary_to_primary',
          targetColumn: 'id',
          targetIndex: Index.Primary,
          sourceIndex: Index.Secondary,
          sourceTable: testTableName,
          sourceColumn: 'primary_id'
        }
      ],
      schema: {
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
      }
    }
  ]);

  const prepareUpdate = <S extends Query.SelectInput<TestTableMetadata>>(
    query: Query.UpdateManyInput<S, TestTableMetadata> | Query.UpdateOneInput<S, TestTableMetadata>
  ) => {
    const builder = new SqlBuilder();

    const relations = getRelationsWithSchema(testTableName, repository);
    const table = repository[testTableName];

    return prepareUpdateQuery(testTableName, table.schema, relations, query, builder);
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
        `"Q0" AS (SELECT "secondary_id", "id" FROM "ez4_test_table"), ` +
        // First relation
        `"Q1" AS (UPDATE ONLY "ez4_test_table" AS "T" SET "foo" = :0 FROM "Q0" WHERE "T"."id" = "Q0"."secondary_id"), ` +
        // Second relation
        `"Q2" AS (UPDATE ONLY "ez4_test_table" AS "T" SET "foo" = :1 FROM "Q0" WHERE "T"."unique_id" = "Q0"."id") ` +
        // Third relation
        `UPDATE ONLY "ez4_test_table" AS "T" SET "foo" = :2 FROM "Q0" WHERE "T"."primary_id" = "Q0"."id"`
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
        `"Q0" AS (SELECT "R0"."secondary_id", "R0"."id" FROM "ez4_test_table" AS "R0"), ` +
        // First relation
        `"Q1" AS (UPDATE ONLY "ez4_test_table" AS "T" SET "foo" = :0 FROM "Q0" WHERE "T"."id" = "Q0"."secondary_id"), ` +
        // Second relation
        `"Q2" AS (UPDATE ONLY "ez4_test_table" AS "T" SET "foo" = :1 FROM "Q0" WHERE "T"."unique_id" = "Q0"."id"), ` +
        // Third relation
        `"Q3" AS (UPDATE ONLY "ez4_test_table" AS "T" SET "foo" = :2 FROM "Q0" WHERE "T"."primary_id" = "Q0"."id") ` +
        // Select
        `SELECT "id", ` +
        `(SELECT jsonb_build_object('foo', "S0"."foo") FROM "ez4_test_table" AS "S0" WHERE "S0"."id" = "Q0"."secondary_id") AS "primary_to_secondary", ` +
        `(SELECT jsonb_build_object('id', "S1"."id") FROM "ez4_test_table" AS "S1" WHERE "S1"."unique_id" = "Q0"."id") AS "unique_to_primary", ` +
        `(SELECT COALESCE(json_agg(jsonb_build_object('foo', "S2"."foo")), '[]'::json) FROM "ez4_test_table" AS "S2" ` +
        `WHERE "S2"."primary_id" = "Q0"."id") AS "secondary_to_primary" ` +
        `FROM "ez4_test_table"`
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
        `"Q0" AS (SELECT "R0"."secondary_id", "R0"."id" FROM "ez4_test_table" AS "R0" WHERE "R0"."id" = :0), ` +
        // First relation
        `"Q1" AS (UPDATE ONLY "ez4_test_table" AS "T" SET "foo" = :1 FROM "Q0" WHERE "T"."id" = "Q0"."secondary_id"), ` +
        // Second relation
        `"Q2" AS (UPDATE ONLY "ez4_test_table" AS "T" SET "foo" = :2 FROM "Q0" WHERE "T"."unique_id" = "Q0"."id"), ` +
        // Third relation
        `"Q3" AS (UPDATE ONLY "ez4_test_table" AS "T" SET "foo" = :3 FROM "Q0" WHERE "T"."primary_id" = "Q0"."id") ` +
        // Select
        `SELECT "id", ` +
        `(SELECT jsonb_build_object('id', "S0"."id") FROM "ez4_test_table" AS "S0" ` +
        `WHERE "S0"."foo" = :4 AND "S0"."id" = "Q0"."secondary_id") AS "primary_to_secondary", ` +
        `(SELECT jsonb_build_object('foo', "S1"."foo") FROM "ez4_test_table" AS "S1" ` +
        `WHERE "S1"."foo" = :5 AND "S1"."unique_id" = "Q0"."id") AS "unique_to_primary", ` +
        `(SELECT COALESCE(json_agg(jsonb_build_object('foo', "S2"."foo")), '[]'::json) FROM "ez4_test_table" AS "S2" ` +
        `WHERE "S2"."foo" = :6 AND "S2"."primary_id" = "Q0"."id") AS "secondary_to_primary" ` +
        `FROM "ez4_test_table"`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000', 'foo1', 'foo2', 'foo3', 123, 456, 789]);
  });
});
