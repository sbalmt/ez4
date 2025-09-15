import type { Index, Query, RelationMetadata } from '@ez4/database';
import type { PostgresEngine } from '@ez4/pgclient/library';
import type { TestSchemaType } from '../client/common/schema';

import { equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { prepareSelectQuery } from '@ez4/pgclient/library';
import { SqlBuilder } from '@ez4/pgsql';

import { TestSchema } from '../client/common/schema';

type TestTableMetadata = {
  engine: PostgresEngine;
  relations: RelationMetadata;
  schema: TestSchemaType;
  indexes: {
    id: Index.Primary;
  };
};

describe('where json missing', () => {
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

  it('assert :: prepare where json missing (operator)', () => {
    const [whereClause, variables] = getWhereOperation({
      json: {
        number: {
          isMissing: true
        }
      }
    });

    equal(whereClause, `WHERE NOT ("json" ? 'number')`);

    deepEqual(variables, []);
  });

  it('assert :: prepare where json not missing (operator)', () => {
    const [whereClause, variables] = getWhereOperation({
      json: {
        number: {
          isMissing: false
        }
      }
    });

    equal(whereClause, `WHERE "json" ? 'number'`);

    deepEqual(variables, []);
  });
});
