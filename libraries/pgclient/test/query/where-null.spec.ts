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

describe('where null', () => {
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

  it('assert :: prepare where null (implicit)', () => {
    const [whereClause, variables] = getWhereOperation({
      string: null
    });

    equal(whereClause, `WHERE "string" IS null`);

    deepEqual(variables, []);
  });

  it('assert :: prepare where json null (explicit)', () => {
    const [whereClause, variables] = getWhereOperation({
      string: {
        equal: null
      }
    });

    equal(whereClause, `WHERE "string" IS null`);

    deepEqual(variables, []);
  });

  it('assert :: prepare where json null (operator)', () => {
    const [whereClause, variables] = getWhereOperation({
      string: {
        isNull: true
      }
    });

    equal(whereClause, `WHERE "string" IS null`);

    deepEqual(variables, []);
  });

  it('assert :: prepare where json not null (explicit)', () => {
    const [whereClause, variables] = getWhereOperation({
      string: {
        not: null
      }
    });

    equal(whereClause, `WHERE "string" IS NOT null`);

    deepEqual(variables, []);
  });

  it('assert :: prepare where json not null (operator)', () => {
    const [whereClause, variables] = getWhereOperation({
      string: {
        isNull: false
      }
    });

    equal(whereClause, `WHERE "string" IS NOT null`);

    deepEqual(variables, []);
  });
});
