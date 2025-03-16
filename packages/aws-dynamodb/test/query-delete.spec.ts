import { equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { prepareDelete } from '@ez4/aws-dynamodb/client';
import { Index } from '@ez4/database';

type TestSchema = {
  id: string;
  foo?: number;
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

type TestIndexes = {
  id: Index.Primary;
};

describe('dynamodb query (delete)', () => {
  it('assert :: prepare delete', () => {
    const [statement, variables] = prepareDelete<TestSchema, {}, TestIndexes, TestRelations>(
      'ez4-test-delete',
      {
        where: {
          id: 'abc'
        }
      }
    );

    equal(statement, `DELETE FROM "ez4-test-delete" WHERE "id" = ?`);

    deepEqual(variables, ['abc']);
  });

  it('assert :: prepare delete (with select)', () => {
    const [statement, variables] = prepareDelete<TestSchema, {}, TestIndexes, TestRelations>(
      'ez4-test-delete',
      {
        select: {
          id: true,
          foo: true,
          bar: true
        },
        where: {
          id: 'abc'
        }
      }
    );

    equal(statement, `DELETE FROM "ez4-test-delete" WHERE "id" = ? RETURNING ALL OLD *`);

    deepEqual(variables, ['abc']);
  });
});
