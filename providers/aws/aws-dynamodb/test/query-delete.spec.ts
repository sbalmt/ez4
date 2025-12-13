import type { TestTableMetadata } from './common/schema';

import { equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { prepareDelete } from '@ez4/aws-dynamodb/client';

import { TestSchema } from './common/schema';

describe('dynamodb query (delete)', () => {
  it('assert :: prepare delete', () => {
    const [statement, variables] = prepareDelete<TestTableMetadata, {}>('ez4-test-delete', TestSchema, {
      where: {
        id: 'abc'
      }
    });

    equal(statement, `DELETE FROM "ez4-test-delete" WHERE "id" = ?`);

    deepEqual(variables, ['abc']);
  });

  it('assert :: prepare delete (with select)', () => {
    const [statement, variables] = prepareDelete<TestTableMetadata, {}>('ez4-test-delete', TestSchema, {
      select: {
        id: true,
        foo: true,
        bar: true
      },
      where: {
        id: 'abc'
      }
    });

    equal(statement, `DELETE FROM "ez4-test-delete" WHERE "id" = ? RETURNING ALL OLD *`);

    deepEqual(variables, ['abc']);
  });
});
