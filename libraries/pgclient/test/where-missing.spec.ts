import type { Index, Query, RelationMetadata } from '@ez4/database';
import type { PostgresEngine } from '@ez4/pgclient/library';
import type { TestSchemaType } from './common/schema';

import { equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { prepareSelectQuery } from '@ez4/pgclient/library';
import { SqlBuilder } from '@ez4/pgsql';

import { TestSchema } from './common/schema';

type TestTableMetadata = {
  engine: PostgresEngine;
  relations: RelationMetadata;
  schema: TestSchemaType;
  indexes: {
    id: Index.Primary;
  };
};

describe('where missing', () => {
  const getWhereOperation = (where: Query.WhereInput<TestTableMetadata>) => {
    const builder = new SqlBuilder();

    const query = prepareSelectQuery(
      builder,
      'ez4-test-where-operation',
      TestSchema,
      {},
      {
        select: {
          id: true
        },
        where
      }
    );

    const [statement, variables] = query.build();

    const whereClause = statement.substring(statement.indexOf('WHERE'));

    return [whereClause, variables];
  };

  it('assert :: prepare where missing (operator)', () => {
    const [whereClause, variables] = getWhereOperation({
      string: {
        isMissing: true
      }
    });

    equal(whereClause, `WHERE "string" IS null`);

    deepEqual(variables, []);
  });

  it('assert :: prepare where not missing (operator)', () => {
    const [whereClause, variables] = getWhereOperation({
      string: {
        isMissing: false
      }
    });

    equal(whereClause, `WHERE "string" IS NOT null`);

    deepEqual(variables, []);
  });
});
