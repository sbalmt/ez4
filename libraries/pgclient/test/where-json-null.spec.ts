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

describe('where json null', () => {
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

  it('assert :: prepare where json null (implicit)', () => {
    const [whereClause, variables] = getWhereOperation({
      json: {
        baz: null
      }
    });

    equal(whereClause, `WHERE ("json"['baz'] IS null OR "json"['baz'] = 'null'::jsonb)`);

    deepEqual(variables, []);
  });

  it('assert :: prepare where json null (explicit)', () => {
    const [whereClause, variables] = getWhereOperation({
      json: {
        baz: {
          equal: null
        }
      }
    });

    equal(whereClause, `WHERE ("json"['baz'] IS null OR "json"['baz'] = 'null'::jsonb)`);

    deepEqual(variables, []);
  });

  it('assert :: prepare where json null (operator)', () => {
    const [whereClause, variables] = getWhereOperation({
      json: {
        baz: {
          isNull: true
        }
      }
    });

    equal(whereClause, `WHERE ("json"['baz'] IS null OR "json"['baz'] = 'null'::jsonb)`);

    deepEqual(variables, []);
  });

  it('assert :: prepare where json not null (explicit)', () => {
    const [whereClause, variables] = getWhereOperation({
      json: {
        baz: {
          not: null
        }
      }
    });

    equal(whereClause, `WHERE ("json"['baz'] IS NOT null AND "json"['baz'] != 'null'::jsonb)`);

    deepEqual(variables, []);
  });

  it('assert :: prepare where json not null (operator)', () => {
    const [whereClause, variables] = getWhereOperation({
      json: {
        baz: {
          isNull: false
        }
      }
    });

    equal(whereClause, `WHERE ("json"['baz'] IS NOT null AND "json"['baz'] != 'null'::jsonb)`);

    deepEqual(variables, []);
  });
});
