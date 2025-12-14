import type { TestTableMetadata } from './common/schema';

import { equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { prepareInsert } from '@ez4/aws-dynamodb/client';
import { TestSchema } from './common/schema';

describe('dynamodb query (insert)', () => {
  it('assert :: prepare insert', () => {
    const [statement, variables] = prepareInsert<TestTableMetadata, {}>('ez4-test-insert', TestSchema, {
      data: {
        id: 'abc',
        foo: 123,
        bar: {
          barFoo: 'def',
          barBar: true
        },
        baz: [],
        qux: []
      }
    });

    equal(statement, `INSERT INTO "ez4-test-insert" value { 'id': ?, 'foo': ?, 'bar': ?, 'baz': ?, 'qux': ? }`);

    deepEqual(variables, ['abc', 123, { barFoo: 'def', barBar: true }, [], []]);
  });

  it('assert :: prepare insert (ignore nulls)', () => {
    const [statement, variables] = prepareInsert<TestTableMetadata, {}>('ez4-test-insert', TestSchema, {
      data: {
        id: 'abc',
        foo: null,
        bar: {
          barFoo: 'def',
          barBar: false
        },
        baz: ['abc', 'def'],
        qux: [1, 2]
      }
    });

    equal(statement, `INSERT INTO "ez4-test-insert" value { 'id': ?, 'bar': ?, 'baz': ?, 'qux': ? }`);

    deepEqual(variables, ['abc', { barFoo: 'def', barBar: false }, ['abc', 'def'], [1, 2]]);
  });
});
