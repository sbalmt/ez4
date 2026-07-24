import type { Query, RelationMetadata } from '@ez4/database';
import type { PostgresEngine } from '@ez4/pgclient/library';
import type { ObjectSchema } from '@ez4/schema';

import { describe, it } from 'node:test';

import { prepareUpdateQuery } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';
import { SqlBuilder } from '@ez4/pgsql';

type TestTableMetadata = {
  engine: PostgresEngine;
  relations: RelationMetadata;
  indexes: {};
  schema: {};
};

describe('update schema', () => {
  const prepareUpdate = async <S extends Query.SelectInput<TestTableMetadata>>(
    schema: ObjectSchema,
    query: Query.UpdateManyInput<S, TestTableMetadata>
  ) => {
    const builder = new SqlBuilder();

    const allQueries = await prepareUpdateQuery(builder, 'ez4-test-update-schema', schema, {}, query);

    return builder.with(allQueries).build();
  };

  it('assert :: prepare update schema (with select)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate(
      {
        type: SchemaType.Object,
        properties: {
          scalar: {
            type: SchemaType.String,
            optional: true
          },
          json: {
            type: SchemaType.Object,
            properties: {
              scalar: {
                type: SchemaType.Number
              }
            }
          }
        }
      },
      {
        select: {
          scalar: true,
          json: {
            scalar: true
          }
        },
        data: {
          scalar: 'foo',
          json: {
            scalar: 123
          }
        }
      }
    );

    assert.equal(
      statement,
      `WITH ` +
        // Select
        `"Q0" AS (SELECT "scalar", jsonb_build_object('scalar', "json"['scalar']) AS "json" FROM "ez4-test-update-schema"), ` +
        // Update
        `"Q1" AS (UPDATE ONLY "ez4-test-update-schema" AS "U" SET "scalar" = :0, "json"['scalar'] = :1 FROM "Q0") ` +
        // Return
        `SELECT "scalar", "json" FROM "Q0"`
    );

    assert.deepEqual(variables, ['foo', 123]);
  });
});
