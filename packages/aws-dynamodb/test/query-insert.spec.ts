import type { DynamoDbEngine } from '@ez4/aws-dynamodb/client';
import type { Index, RelationMetadata } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';

import { equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { prepareInsert } from '@ez4/aws-dynamodb/client';
import { SchemaType } from '@ez4/schema';

type TestTableMetadata = {
  engine: DynamoDbEngine;
  relations: RelationMetadata;
  indexes: {
    id: Index.Primary;
  };
  schema: {
    id: string;
    foo?: number | null;
    bar: {
      barFoo: string;
      barBar: boolean;
    };
  };
};

describe('dynamodb query (insert)', () => {
  const testSchema: ObjectSchema = {
    type: SchemaType.Object,
    properties: {
      id: {
        type: SchemaType.String
      },
      foo: {
        type: SchemaType.Number,
        nullable: true,
        optional: true
      },
      bar: {
        type: SchemaType.Object,
        properties: {
          barFoo: {
            type: SchemaType.String
          },
          barBar: {
            type: SchemaType.Boolean
          }
        }
      }
    }
  };

  it('assert :: prepare insert', () => {
    const [statement, variables] = prepareInsert<TestTableMetadata, {}>('ez4-test-insert', testSchema, {
      data: {
        id: 'abc',
        foo: 123,
        bar: {
          barFoo: 'def',
          barBar: true
        }
      }
    });

    equal(statement, `INSERT INTO "ez4-test-insert" value { 'id': ?, 'foo': ?, 'bar': ? }`);

    deepEqual(variables, ['abc', 123, { barFoo: 'def', barBar: true }]);
  });

  it('assert :: prepare insert (ignore nulls)', () => {
    const [statement, variables] = prepareInsert<TestTableMetadata, {}>('ez4-test-insert', testSchema, {
      data: {
        id: 'abc',
        foo: null,
        bar: {
          barFoo: 'def',
          barBar: false
        }
      }
    });

    equal(statement, `INSERT INTO "ez4-test-insert" value { 'id': ?, 'bar': ? }`);

    deepEqual(variables, ['abc', { barFoo: 'def', barBar: false }]);
  });
});
