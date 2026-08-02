import type { Query, RelationMetadata } from '@ez4/database';
import type { PostgresEngine } from '@ez4/pgclient';
import type { ObjectSchema } from '@ez4/schema';

import { describe, it } from 'node:test';

import { SchemaType } from '@ez4/schema';
import { SqlBuilder } from '@ez4/pgsql';

import { prepareInsertQuery } from '../../src/queries/insert';

type TestTableMetadata = {
  engine: PostgresEngine;
  relations: RelationMetadata;
  indexes: {};
  schema: {};
};

describe('insert schema', () => {
  const prepareInsert = async <S extends Query.SelectInput<TestTableMetadata>>(
    schema: ObjectSchema,
    input: Query.InsertOneInput<S, TestTableMetadata>
  ) => {
    const builder = new SqlBuilder();

    const { queries } = await prepareInsertQuery(builder, 'ez4-test-insert-schema', schema, {}, input);

    return builder.with(queries).build();
  };

  it('assert :: prepare insert schema (with select)', async ({ assert }) => {
    const [statement, variables] = await prepareInsert(
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
      `WITH "Q0" AS (INSERT INTO "ez4-test-insert-schema" ("scalar", "json") VALUES (:0, :1) RETURNING "scalar", "json") ` +
        `SELECT "scalar", jsonb_build_object('scalar', "json"['scalar']) AS "json" FROM "Q0"`
    );

    assert.deepEqual(variables, ['foo', { scalar: 123 }]);
  });
});
