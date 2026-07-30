import type { DynamoDbEngine } from '@ez4/aws-dynamodb/client';
import type { Query, RelationMetadata } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';

import { equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { prepareUpdate } from '@ez4/aws-dynamodb/client';
import { SchemaType } from '@ez4/schema';

type TestTableMetadata = {
  engine: DynamoDbEngine;
  relations: RelationMetadata;
  indexes: {};
  schema: {};
};

describe('update schema', () => {
  const prepareUpdateQuery = <S extends Query.SelectInput<TestTableMetadata>>(
    schema: ObjectSchema,
    input: Query.UpdateManyInput<S, TestTableMetadata>,
    indexes?: string[][]
  ) => {
    return prepareUpdate<TestTableMetadata, {}>('ez4-test-update', schema, indexes ?? [], input);
  };

  it('assert :: prepare update (null on index)', async () => {
    const [statement, variables] = await prepareUpdateQuery(
      {
        type: SchemaType.Object,
        properties: {
          foo: {
            type: SchemaType.Number,
            nullable: true
          }
        }
      },
      {
        data: {
          foo: null
        }
      },
      [['id', 'foo']]
    );

    equal(statement, `UPDATE "ez4-test-update" REMOVE "foo"`);

    deepEqual(variables, []);
  });

  it('assert :: prepare update (with select)', async () => {
    const [statement, variables] = await prepareUpdateQuery(
      {
        type: SchemaType.Object,
        properties: {
          id: {
            type: SchemaType.String
          },
          foo: {
            type: SchemaType.String
          },
          bar: {
            type: SchemaType.Number
          }
        }
      },
      {
        select: {
          foo: true,
          bar: true
        },
        data: {
          foo: 'abc',
          bar: 123
        },
        where: {
          id: 'id'
        } as any
      }
    );

    equal(statement, `UPDATE "ez4-test-update" SET "foo" = ? SET "bar" = ? WHERE "id" = ? RETURNING ALL OLD *`);

    deepEqual(variables, ['abc', 123, 'id']);
  });
});
