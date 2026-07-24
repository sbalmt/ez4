import type { TestTableMetadata } from './common/schema';

import { equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { prepareUpdate } from '@ez4/aws-dynamodb/client';

import { TestSchema } from './common/schema';

describe('dynamodb query (update)', () => {
  it('assert :: prepare update', async () => {
    const [statement, variables] = await prepareUpdate<TestTableMetadata, {}>('ez4-test-update', TestSchema, {
      data: {
        foo: 456
      },
      where: {
        foo: 123
      }
    });

    equal(statement, `UPDATE "ez4-test-update" SET "foo" = ? WHERE "foo" = ?`);

    deepEqual(variables, [456, 123]);
  });

  it('assert :: prepare update (to null)', async () => {
    const [statement, variables] = await prepareUpdate<TestTableMetadata, {}>('ez4-test-update', TestSchema, {
      data: {
        foo: null,
        bar: {
          barFoo: 'abc'
        }
      }
    });

    equal(statement, `UPDATE "ez4-test-update" SET "foo" = ? SET "bar"."barFoo" = ?`);

    deepEqual(variables, [null, 'abc']);
  });

  it('assert :: prepare update (with select)', async () => {
    const [statement, variables] = await prepareUpdate<TestTableMetadata, {}>('ez4-test-update', TestSchema, {
      select: {
        foo: true,
        bar: {
          barBar: true
        }
      },
      data: {
        foo: 456,
        bar: {
          barBar: false
        }
      },
      where: {
        id: 'abc'
      }
    });

    equal(statement, `UPDATE "ez4-test-update" SET "foo" = ? SET "bar"."barBar" = ? WHERE "id" = ? RETURNING ALL OLD *`);

    deepEqual(variables, [456, false, 'abc']);
  });
});
