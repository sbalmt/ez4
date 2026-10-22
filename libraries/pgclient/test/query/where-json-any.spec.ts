import type { Index, Query, RelationMetadata } from '@ez4/database';
import type { PostgresEngine } from '@ez4/pgclient';
import type { TestSchemaType } from '../client/common/schema';

import { deepEqual, equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ClientDriver } from '../../src/driver/client';
import { createQueryBuilder } from '../../src/queries/utils/builder';
import { prepareSelectQuery } from '../../src/queries/select';
import { TestSchema } from '../client/common/schema';

type TestTableMetadata = {
  engine: PostgresEngine;
  relations: RelationMetadata;
  schema: TestSchemaType;
  indexes: {
    id: Index.Primary;
  };
};

describe('where dynamic json parameters', () => {
  const tableName = 'ez4-test-where-operation';

  const getWhereOperation = (where: Query.WhereInput<TestTableMetadata>) => {
    const builder = createQueryBuilder(new ClientDriver());

    const { query } = prepareSelectQuery(
      builder,
      tableName,
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

  it('assert :: dynamic json NOT IN strings', () => {
    const [whereClause, variables] = getWhereOperation({
      NOT: {
        extensible_json: {
          to: {
            isIn: ['foo', 'bar']
          }
        }
      }
    });

    equal(whereClause, `WHERE NOT "extensible_json"['to'] IN (:0, :1)`);

    deepEqual(variables, [
      { name: '0', type: 'jsonb', value: '"foo"' },
      { name: '1', type: 'jsonb', value: '"bar"' }
    ]);
  });

  it('assert :: dynamic json equal string', () => {
    const [whereClause, variables] = getWhereOperation({
      extensible_json: {
        value: {
          equal: 'foo'
        }
      }
    });

    equal(whereClause, `WHERE "extensible_json"['value'] = :0`);

    deepEqual(variables, [{ name: '0', type: 'jsonb', value: '"foo"' }]);
  });

  it('assert :: dynamic json equal number', () => {
    const [whereClause, variables] = getWhereOperation({
      extensible_json: {
        value: {
          equal: 123
        }
      }
    });

    equal(whereClause, `WHERE "extensible_json"['value'] = :0`);

    deepEqual(variables, [{ name: '0', type: 'jsonb', value: '123' }]);
  });

  it('assert :: dynamic json equal boolean', () => {
    const [whereClause, variables] = getWhereOperation({
      extensible_json: {
        value: {
          equal: true
        }
      }
    });

    equal(whereClause, `WHERE "extensible_json"['value'] = :0`);

    deepEqual(variables, [{ name: '0', type: 'jsonb', value: 'true' }]);
  });

  it('assert :: dynamic json equal array', () => {
    const [whereClause, variables] = getWhereOperation({
      extensible_json: {
        value: {
          equal: [1, 'foo']
        }
      }
    });

    equal(whereClause, `WHERE "extensible_json"['value'] = :0`);

    deepEqual(variables, [{ name: '0', type: 'jsonb', value: '[1,"foo"]' }]);
  });

  it('assert :: dynamic json equal object', () => {
    const [whereClause, variables] = getWhereOperation({
      extensible_json: {
        value: {
          equal: { foo: 'bar' }
        }
      }
    });

    equal(whereClause, `WHERE "extensible_json"['value'] = :0`);

    deepEqual(variables, [{ name: '0', type: 'jsonb', value: '{"foo":"bar"}' }]);
  });

  it('assert :: nested dynamic json with multiple operators', () => {
    const [whereClause, variables] = getWhereOperation({
      extensible_json: {
        nested: {
          value: {
            gte: 1,
            lt: 3
          }
        }
      }
    });

    equal(whereClause, `WHERE ("extensible_json"['nested']['value'] >= :0 AND "extensible_json"['nested']['value'] < :1)`);

    deepEqual(variables, [
      { name: '0', type: 'jsonb', value: '1' },
      { name: '1', type: 'jsonb', value: '3' }
    ]);
  });

  it('assert :: declared json fields retain schema-driven parameters', () => {
    const [whereClause, variables] = getWhereOperation({
      json: {
        string: {
          isIn: ['foo', 'bar']
        }
      },
      integer: {
        gte: 1,
        lt: 3
      }
    });

    equal(whereClause, `WHERE "json"->>'string' IN (:0, :1) AND ("integer" >= :2 AND "integer" < :3)`);

    deepEqual(variables, [
      { name: '0', type: 'text', value: 'foo' },
      { name: '1', type: 'text', value: 'bar' },
      { name: '2', type: 'bigint', value: 1 },
      { name: '3', type: 'bigint', value: 3 }
    ]);
  });

  it('assert :: top-level fields retain schema-driven parameters', () => {
    const [whereClause, variables] = getWhereOperation({
      string: {
        isIn: ['foo', 'bar']
      }
    });

    equal(whereClause, `WHERE "string" IN (:0, :1)`);

    deepEqual(variables, [
      { name: '0', type: 'text', value: 'foo' },
      { name: '1', type: 'text', value: 'bar' }
    ]);
  });

  it('assert :: declared nested json multiple operators retain casts', () => {
    const [whereClause, variables] = getWhereOperation({
      json: {
        number: { gte: 1, lt: 3 }
      }
    });

    equal(whereClause, `WHERE (("json"->>'number')::dec >= :0 AND ("json"->>'number')::dec < :1)`);

    deepEqual(variables, [
      { name: '0', type: 'decimal', value: 1 },
      { name: '1', type: 'decimal', value: 3 }
    ]);
  });
});
