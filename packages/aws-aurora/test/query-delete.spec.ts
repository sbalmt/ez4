import { equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { prepareDeleteQuery } from '@ez4/aws-aurora/client';

import { ObjectSchema, SchemaTypeName } from '@ez4/schema';
import { Index } from '@ez4/database';

type TestSchema = {
  id: string;
  foo?: number;
  bar?: boolean;
};

type TestIndexes = {
  id: Index.Primary;
};

describe.only('aurora query delete', () => {
  const testSchema: ObjectSchema = {
    type: SchemaTypeName.Object,
    properties: {
      id: {
        type: SchemaTypeName.String,
        format: 'uuid'
      },
      foo: {
        type: SchemaTypeName.Number,
        optional: true
      },
      bar: {
        type: SchemaTypeName.Boolean,
        optional: true
      }
    }
  };

  it.only('assert :: prepare delete', () => {
    const [statement, variables] = prepareDeleteQuery<TestSchema, TestIndexes, {}, {}>(
      'ez4-test-delete',
      testSchema,
      {},
      {
        where: {
          id: 'abc'
        }
      }
    );

    equal(statement, `DELETE FROM "ez4-test-delete" WHERE "id" = :0`);

    deepEqual(variables, [
      {
        name: '0',
        typeHint: 'UUID',
        value: {
          stringValue: 'abc'
        }
      }
    ]);
  });

  it.only('assert :: prepare delete (with select)', () => {
    const [statement, variables] = prepareDeleteQuery<TestSchema, TestIndexes, {}, {}>(
      'ez4-test-delete',
      testSchema,
      {},
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

    equal(statement, `DELETE FROM "ez4-test-delete" WHERE "id" = :0 RETURNING "id", "foo", "bar"`);

    deepEqual(variables, [
      {
        name: '0',
        typeHint: 'UUID',
        value: {
          stringValue: 'abc'
        }
      }
    ]);
  });
});
