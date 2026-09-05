import { beforeEach, describe, it } from 'node:test';

import { SqlBuilder } from '@ez4/pgsql';

describe('sql having tests', () => {
  let sql: SqlBuilder;

  beforeEach(() => {
    sql = new SqlBuilder();
  });

  it('assert :: having no filters', ({ assert }) => {
    const query = sql.select().from('test').having();

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, `SELECT FROM "test"`);
  });

  it('assert :: having equal (implicit)', ({ assert }) => {
    const query = sql.select().from('test').having({
      foo: 'abc'
    });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, ['abc']);

    assert.equal(statement, 'SELECT FROM "test" HAVING "foo" = :0');
  });

  it('assert :: having equal (explicit)', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .having({
        foo: {
          equal: 'abc'
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, ['abc']);

    assert.equal(statement, 'SELECT FROM "test" HAVING "foo" = :0');
  });

  it('assert :: having not equal', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .having({
        foo: {
          not: 123
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [123]);

    assert.equal(statement, 'SELECT FROM "test" HAVING "foo" != :0');
  });

  it('assert :: having greater than', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .having({
        foo: {
          gt: 0
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [0]);

    assert.equal(statement, 'SELECT FROM "test" HAVING "foo" > :0');
  });

  it('assert :: having greater than or equal', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .having({
        foo: {
          gte: 0
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [0]);

    assert.equal(statement, 'SELECT FROM "test" HAVING "foo" >= :0');
  });

  it('assert :: having less than', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .having({
        foo: {
          lt: 0
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [0]);

    assert.equal(statement, 'SELECT FROM "test" HAVING "foo" < :0');
  });

  it('assert :: having less than or equal', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .having({
        foo: {
          lte: 0
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [0]);

    assert.equal(statement, 'SELECT FROM "test" HAVING "foo" <= :0');
  });

  it('assert :: having is in', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .having({
        foo: {
          isIn: [1, 2, 3]
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [1, 2, 3]);

    assert.equal(statement, 'SELECT FROM "test" HAVING "foo" IN (:0, :1, :2)');
  });

  it('assert :: having is between', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .having({
        foo: {
          isBetween: [1, 2]
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [1, 2]);

    assert.equal(statement, 'SELECT FROM "test" HAVING "foo" BETWEEN :0 AND :1');
  });

  it('assert :: having multiple operators', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .having({
        foo: {
          gte: 123,
          lt: 456
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [123, 456]);

    assert.equal(statement, 'SELECT FROM "test" HAVING ("foo" >= :0 AND "foo" < :1)');
  });

  it('assert :: having not', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .having({
        NOT: {
          foo: 123,
          bar: 'abc'
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [123, 'abc']);

    assert.equal(statement, 'SELECT FROM "test" HAVING NOT ("foo" = :0 AND "bar" = :1)');
  });

  it('assert :: having and', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .having({
        AND: [
          {
            foo: 123,
            bar: 'abc'
          },
          {
            OR: [
              {
                baz: 456
              },
              {
                qux: 789
              }
            ]
          }
        ]
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [123, 'abc', 456, 789]);

    assert.equal(statement, 'SELECT FROM "test" HAVING ("foo" = :0 AND "bar" = :1 AND ("baz" = :2 OR "qux" = :3))');
  });

  it('assert :: having or', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .having({
        OR: [
          {
            foo: 123,
            bar: 'abc'
          },
          {
            AND: [
              {
                baz: 456
              },
              {
                qux: 789
              }
            ]
          }
        ]
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [123, 'abc', 456, 789]);

    assert.equal(statement, 'SELECT FROM "test" HAVING (("foo" = :0 AND "bar" = :1) OR ("baz" = :2 AND "qux" = :3))');
  });

  it('assert :: having with alias', ({ assert }) => {
    const query = sql.select().from('test').as('alias').having({
      foo: true
    });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [true]);

    assert.equal(statement, `SELECT FROM "test" AS "alias" HAVING "alias"."foo" = :0`);
  });

  it('assert :: having with raw value', ({ assert }) => {
    const query = sql.select().from('test');

    query.having({
      foo: sql.rawValue(() => 'plain_foo'),
      bar: sql.rawValue('plain_bar')
    });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, `SELECT FROM "test" HAVING "foo" = plain_foo AND "bar" = plain_bar`);
  });

  it('assert :: having with reference', ({ assert }) => {
    const query = sql.select().from('test');

    query.having({
      foo: {
        bar: {
          baz: query.reference('column')
        }
      }
    });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, `SELECT FROM "test" HAVING "foo"['bar']['baz'] = "column"`);
  });
});
