import type { DynamoDbEngine } from '@ez4/aws-dynamodb/client';
import type { Query, RelationMetadata } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';

import { equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { prepareInsert } from '@ez4/aws-dynamodb/client';
import { SchemaType } from '@ez4/schema';

type TestTableMetadata = {
  engine: DynamoDbEngine;
  relations: RelationMetadata;
  indexes: {};
  schema: {};
};

describe('insert schema', () => {
  const prepareInsertQuery = <S extends Query.SelectInput<TestTableMetadata>>(
    schema: ObjectSchema,
    input: Query.UpdateManyInput<S, TestTableMetadata>,
    indexes?: string[][]
  ) => {
    return prepareInsert<TestTableMetadata, {}>('ez4-test-insert', schema, indexes ?? [], input);
  };

  it('assert :: prepare insert (null on index)', async () => {
    const [statement, variables] = await prepareInsertQuery(
      {
        type: SchemaType.Object,
        properties: {
          id: {
            type: SchemaType.String
          },
          foo: {
            type: SchemaType.Number,
            nullable: true
          }
        }
      },
      {
        data: {
          id: 'abc',
          foo: null
        }
      },
      [['id', 'foo']]
    );

    equal(statement, `INSERT INTO "ez4-test-insert" value { 'id': ? }`);

    deepEqual(variables, ['abc']);
  });
});
