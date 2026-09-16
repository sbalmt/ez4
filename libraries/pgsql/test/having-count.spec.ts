import type { SqlSelectStatement } from '@ez4/pgsql';

import { beforeEach, describe, it } from 'node:test';

import { SqlBuilder } from '@ez4/pgsql';

describe('sql having count tests', () => {
  let sql: SqlSelectStatement;

  beforeEach(() => {
    sql = new SqlBuilder().select().from('test');
  });

  it('assert :: having equal (count)', ({ assert }) => {
    const query = sql.having({
      '*': {
        count: true,
        equal: 1
      }
    });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [1]);

    assert.equal(statement, `SELECT FROM "test" HAVING COUNT(*) = :0`);
  });

  it('assert :: having not equal (count)', ({ assert }) => {
    const query = sql.having({
      '*': {
        count: true,
        not: 1
      }
    });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [1]);

    assert.equal(statement, `SELECT FROM "test" HAVING COUNT(*) != :0`);
  });

  it('assert :: having greater than (count)', ({ assert }) => {
    const query = sql.having({
      '*': {
        count: true,
        gt: 0
      }
    });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [0]);

    assert.equal(statement, 'SELECT FROM "test" HAVING COUNT(*) > :0');
  });

  it('assert :: having greater than or equal (count)', ({ assert }) => {
    const query = sql.having({
      '*': {
        count: true,
        gte: 0
      }
    });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [0]);

    assert.equal(statement, 'SELECT FROM "test" HAVING COUNT(*) >= :0');
  });

  it('assert :: having less than (count)', ({ assert }) => {
    const query = sql.having({
      '*': {
        count: true,
        lt: 0
      }
    });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [0]);

    assert.equal(statement, 'SELECT FROM "test" HAVING COUNT(*) < :0');
  });

  it('assert :: having less than or equal (count)', ({ assert }) => {
    const query = sql.having({
      '*': {
        count: true,
        lte: 0
      }
    });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [0]);

    assert.equal(statement, 'SELECT FROM "test" HAVING COUNT(*) <= :0');
  });

  it('assert :: having is in (count)', ({ assert }) => {
    const query = sql.having({
      '*': {
        count: true,
        isIn: [1, 2, 3]
      }
    });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [1, 2, 3]);

    assert.equal(statement, 'SELECT FROM "test" HAVING COUNT(*) IN (:0, :1, :2)');
  });

  it('assert :: having is between (count)', ({ assert }) => {
    const query = sql.having({
      '*': {
        count: true,
        isBetween: [1, 2]
      }
    });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [1, 2]);

    assert.equal(statement, 'SELECT FROM "test" HAVING COUNT(*) BETWEEN :0 AND :1');
  });
});
