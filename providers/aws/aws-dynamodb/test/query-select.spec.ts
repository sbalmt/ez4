import type { DynamoDbEngine } from '@ez4/aws-dynamodb/client';
import type { Index, RelationMetadata } from '@ez4/database';

import { equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { prepareSelect } from '@ez4/aws-dynamodb/client';
import { Order } from '@ez4/database';

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

describe('dynamodb query (select)', () => {
  it('assert :: prepare select', () => {
    const [statement, variables] = prepareSelect<TestTableMetadata, {}, false>('ez4-test-select', undefined, {
      select: {
        id: true,
        foo: true,
        bar: true
      },
      where: {
        foo: 123
      },
      order: {
        id: Order.Desc
      }
    });

    equal(statement, `SELECT "id", "foo", "bar" ` + `FROM "ez4-test-select" ` + `WHERE "foo" = ? ` + `ORDER BY "id" DESC`);

    deepEqual(variables, [123]);
  });

  it('assert :: prepare select (with index)', () => {
    const [statement, variables] = prepareSelect<TestTableMetadata, {}, false>('ez4-test-select', 'foo-index', {
      select: {
        id: true
      },
      where: {
        foo: 123
      }
    });

    equal(statement, `SELECT "id" FROM "ez4-test-select"."foo-index" WHERE "foo" = ?`);

    deepEqual(variables, [123]);
  });
});
