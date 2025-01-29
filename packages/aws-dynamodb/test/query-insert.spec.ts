import { equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { prepareInsert } from '@ez4/aws-dynamodb/client';
import { ObjectSchema, SchemaType } from '@ez4/schema';

type TestSchema = {
  id: string;
  foo?: number | null;
  bar: {
    barFoo: string;
    barBar: boolean;
  };
};

type TestRelations = {
  indexes: never;
  filters: {};
  selects: {};
  changes: {};
};

describe.only('dynamodb query (insert)', () => {
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
    const [statement, variables] = prepareInsert<TestSchema, TestRelations>(
      'ez4-test-insert',
      testSchema,
      {
        data: {
          id: 'abc',
          foo: 123,
          bar: {
            barFoo: 'def',
            barBar: true
          }
        }
      }
    );

    equal(statement, `INSERT INTO "ez4-test-insert" value { 'id': ?, 'foo': ?, 'bar': ? }`);

    deepEqual(variables, ['abc', 123, { barFoo: 'def', barBar: true }]);
  });

  it('assert :: prepare insert (ignore nulls)', () => {
    const [statement, variables] = prepareInsert<TestSchema, TestRelations>(
      'ez4-test-insert',
      testSchema,
      {
        data: {
          id: 'abc',
          foo: null,
          bar: {
            barFoo: 'def',
            barBar: false
          }
        }
      }
    );

    equal(statement, `INSERT INTO "ez4-test-insert" value { 'id': ?, 'bar': ? }`);

    deepEqual(variables, ['abc', { barFoo: 'def', barBar: false }]);
  });
});
