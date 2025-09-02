import type { Query, RelationMetadata } from '@ez4/database';
import type { PostgresEngine } from '@ez4/pgclient/library';
import type { ObjectSchema } from '@ez4/schema';

import { describe, it } from 'node:test';

import { prepareUpsertQuery } from '@ez4/pgclient/library';
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

describe('upsert scenarios', () => {
  const commonId = '00000000-0000-1000-9000-000000000000';

  const indexes = [
    {
      type: Index.Primary,
      columns: ['id'],
      name: 'id_pk'
    }
  ];

  const prepareUpsert = <S extends Query.SelectInput<TestTableMetadata>>(
    schema: ObjectSchema,
    query: Query.UpsertOneInput<S, TestTableMetadata>
  ) => {
    const builder = new SqlBuilder();

    return prepareUpsertQuery('ez4-test-upsert-schema', schema, {}, indexes, query, builder);
  };

  it('assert :: prepare upsert (only insert)', async ({ assert }) => {
    const [statement, variables] = await prepareUpsert(
      {
        type: SchemaType.Object,
        properties: {
          id: {
            type: SchemaType.String
          },
          foo: {
            type: SchemaType.Boolean
          }
        }
      },
      {
        update: {},
        insert: {
          id: commonId,
          foo: true
        },
        where: {
          id: commonId
        }
      }
    );

    assert.equal(statement, `INSERT INTO "ez4-test-upsert-schema" ("id", "foo") VALUES (:0, :1) ON CONFLICT ("id") DO NOTHING`);

    assert.deepEqual(variables, [commonId, true]);
  });

  it('assert :: prepare upsert (only insert and update)', async ({ assert }) => {
    const [statement, variables] = await prepareUpsert(
      {
        type: SchemaType.Object,
        properties: {
          id: {
            type: SchemaType.String
          },
          foo: {
            type: SchemaType.Boolean
          }
        }
      },
      {
        update: {
          foo: false
        },
        insert: {
          id: commonId,
          foo: true
        },
        where: {
          id: commonId
        }
      }
    );

    assert.equal(
      statement,
      `INSERT INTO "ez4-test-upsert-schema" ("id", "foo") VALUES (:0, :1) ON CONFLICT ("id") DO UPDATE SET "foo" = :2`
    );

    assert.deepEqual(variables, [commonId, true, false]);
  });

  it('assert :: prepare upsert (only insert and select)', async ({ assert }) => {
    const [statement, variables] = await prepareUpsert(
      {
        type: SchemaType.Object,
        properties: {
          id: {
            type: SchemaType.String
          },
          foo: {
            type: SchemaType.Boolean
          }
        }
      },
      {
        select: {
          id: true
        },
        update: {},
        insert: {
          id: commonId,
          foo: false
        },
        where: {
          id: commonId
        }
      }
    );

    assert.equal(
      statement,
      `WITH ` +
        // Current record
        `"Q0" AS (SELECT "id", 0 AS "__EZ4_ORDER" FROM "ez4-test-upsert-schema" WHERE "id" = :0 FOR UPDATE), ` +
        // Insert operation
        `"Q1" AS (INSERT INTO "ez4-test-upsert-schema" ("id", "foo") VALUES (:1, :2) ` +
        `ON CONFLICT ("id") DO NOTHING ` +
        `RETURNING "id", 1 AS "__EZ4_ORDER") ` +
        // Result record
        `SELECT "id" FROM "Q1" NATURAL FULL JOIN "Q0" ` +
        `ORDER BY "__EZ4_ORDER" ASC ` +
        `LIMIT 1`
    );

    assert.deepEqual(variables, [commonId, commonId, false]);
  });

  it('assert :: prepare upsert (complete)', async ({ assert }) => {
    const [statement, variables] = await prepareUpsert(
      {
        type: SchemaType.Object,
        properties: {
          id: {
            type: SchemaType.String
          },
          foo: {
            type: SchemaType.Boolean
          },
          bar: {
            type: SchemaType.Number,
            optional: true,
            nullable: true
          }
        }
      },
      {
        select: {
          id: true,
          foo: true
        },
        update: {
          foo: false,
          bar: 123
        },
        insert: {
          id: commonId,
          foo: true
        },
        where: {
          id: commonId
        }
      }
    );

    assert.equal(
      statement,
      `WITH ` +
        // Current record
        `"Q0" AS (SELECT "id", "foo", 0 AS "__EZ4_ORDER" FROM "ez4-test-upsert-schema" WHERE "id" = :0 FOR UPDATE), ` +
        // Insert operation
        `"Q1" AS (INSERT INTO "ez4-test-upsert-schema" ("id", "foo") VALUES (:1, :2) ` +
        `ON CONFLICT ("id") DO UPDATE SET "foo" = :3, "bar" = :4 ` +
        `RETURNING "id", "foo", 1 AS "__EZ4_ORDER") ` +
        // Result record
        `SELECT "id", "foo" FROM "Q1" NATURAL FULL JOIN "Q0" ` +
        `ORDER BY "__EZ4_ORDER" ASC ` +
        `LIMIT 1`
    );

    assert.deepEqual(variables, [commonId, commonId, true, false, 123]);
  });
});
