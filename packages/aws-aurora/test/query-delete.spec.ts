import type { PostgresEngine } from '@ez4/aws-aurora/client';
import type { RelationMetadata, Index } from '@ez4/database';

import { equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { prepareDeleteQuery } from '@ez4/aws-aurora/client';
import { ObjectSchema, SchemaType } from '@ez4/schema';

import { makeParameter } from './common/parameters.js';

type TestTableMetadata = {
  engine: PostgresEngine;
  relations: RelationMetadata;
  indexes: {
    id: Index.Primary;
  };
  schema: {
    id: string;
    foo?: number;
    bar?: boolean;
  };
};

describe('aurora query (delete)', () => {
  const testSchema: ObjectSchema = {
    type: SchemaType.Object,
    properties: {
      id: {
        type: SchemaType.String,
        format: 'uuid'
      },
      foo: {
        type: SchemaType.Number,
        optional: true
      },
      bar: {
        type: SchemaType.Boolean,
        optional: true
      }
    }
  };

  it('assert :: prepare delete', () => {
    const [statement, variables] = prepareDeleteQuery<TestTableMetadata, {}>(
      'ez4-test-delete',
      testSchema,
      {},
      {
        where: {
          id: '00000000-0000-1000-9000-000000000000'
        }
      }
    );

    equal(statement, `DELETE FROM "ez4-test-delete" WHERE "id" = :0`);

    deepEqual(variables, [makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID')]);
  });

  it('assert :: prepare delete (with select)', () => {
    const [statement, variables] = prepareDeleteQuery<TestTableMetadata, {}>(
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
          id: '00000000-0000-1000-9000-000000000000'
        }
      }
    );

    equal(statement, `DELETE FROM "ez4-test-delete" WHERE "id" = :0 RETURNING "id", "foo", "bar"`);

    deepEqual(variables, [makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID')]);
  });
});
