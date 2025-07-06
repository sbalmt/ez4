import type { DynamoDbEngine } from '@ez4/aws-dynamodb/client';
import type { Index, RelationMetadata } from '@ez4/database';

import { equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { prepareDelete } from '@ez4/aws-dynamodb/client';

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

describe('dynamodb query (delete)', () => {
  it('assert :: prepare delete', () => {
    const [statement, variables] = prepareDelete<TestTableMetadata, {}>('ez4-test-delete', {
      where: {
        id: 'abc'
      }
    });

    equal(statement, `DELETE FROM "ez4-test-delete" WHERE "id" = ?`);

    deepEqual(variables, ['abc']);
  });

  it('assert :: prepare delete (with select)', () => {
    const [statement, variables] = prepareDelete<TestTableMetadata, {}>('ez4-test-delete', {
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
