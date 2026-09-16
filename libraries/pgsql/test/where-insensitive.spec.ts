import type { SqlSelectStatement } from '@ez4/pgsql';

import { beforeEach, describe, it } from 'node:test';

import { SqlBuilder } from '@ez4/pgsql';

describe('sql where insensitive tests', () => {
  let sql: SqlSelectStatement;

  beforeEach(() => {
    sql = new SqlBuilder().select().from('test');
  });

  it('assert :: where equal (insensitive)', ({ assert }) => {
    const query = sql.where({
      foo: {
        insensitive: true,
        equal: 'abc'
      }
    });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, ['abc']);

    assert.equal(statement, `SELECT FROM "test" WHERE LOWER("foo") = LOWER(:0)`);
  });

  it('assert :: where not equal (insensitive)', ({ assert }) => {
    const query = sql.where({
      foo: {
        insensitive: true,
        not: 'abc'
      }
    });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, ['abc']);

    assert.equal(statement, `SELECT FROM "test" WHERE LOWER("foo") != LOWER(:0)`);
  });
});
