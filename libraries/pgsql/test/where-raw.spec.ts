import { beforeEach, describe, it } from 'node:test';

import { SqlBuilder } from '@ez4/pgsql';

describe('sql where raw tests', () => {
  let sql: SqlBuilder;

  beforeEach(() => {
    sql = new SqlBuilder();
  });

  it('assert :: where no filters', ({ assert }) => {
    const query = sql.select().from('test').where();

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, `SELECT * FROM "test"`);
  });

  it('assert :: where equal (implicit)', ({ assert }) => {
    const query = sql.select().from('test').where({
      foo: 'abc'
    });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, ['abc']);

    assert.equal(statement, 'SELECT * FROM "test" WHERE "foo" = :0');
  });

  it('assert :: where equal (explicit)', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          equal: 'abc'
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, ['abc']);

    assert.equal(statement, 'SELECT * FROM "test" WHERE "foo" = :0');
  });

  it('assert :: where equal (with insensitive)', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          insensitive: true,
          equal: 'abc'
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, ['abc']);

    assert.equal(statement, `SELECT * FROM "test" WHERE LOWER("foo") = LOWER(:0)`);
  });

  it('assert :: where not equal', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          not: 123
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [123]);

    assert.equal(statement, 'SELECT * FROM "test" WHERE "foo" != :0');
  });

  it('assert :: where not equal (with insensitive)', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          insensitive: true,
          not: 'abc'
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, ['abc']);

    assert.equal(statement, `SELECT * FROM "test" WHERE LOWER("foo") != LOWER(:0)`);
  });

  it('assert :: where greater than', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          gt: 0
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [0]);

    assert.equal(statement, 'SELECT * FROM "test" WHERE "foo" > :0');
  });

  it('assert :: where greater than or equal', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          gte: 0
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [0]);

    assert.equal(statement, 'SELECT * FROM "test" WHERE "foo" >= :0');
  });

  it('assert :: where less than', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          lt: 0
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [0]);

    assert.equal(statement, 'SELECT * FROM "test" WHERE "foo" < :0');
  });

  it('assert :: where less than or equal', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          lte: 0
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [0]);

    assert.equal(statement, 'SELECT * FROM "test" WHERE "foo" <= :0');
  });

  it('assert :: where is in', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          isIn: [1, 2, 3]
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [1, 2, 3]);

    assert.equal(statement, 'SELECT * FROM "test" WHERE "foo" IN (:0, :1, :2)');
  });

  it('assert :: where is between', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          isBetween: [1, 2]
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [1, 2]);

    assert.equal(statement, 'SELECT * FROM "test" WHERE "foo" BETWEEN :0 AND :1');
  });

  it('assert :: where is missing', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          isMissing: true
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, 'SELECT * FROM "test" WHERE "foo" IS null');
  });

  it('assert :: where is not missing', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          isMissing: false
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, 'SELECT * FROM "test" WHERE "foo" IS NOT null');
  });

  it('assert :: where is null (implicit)', ({ assert }) => {
    const query = sql.select().from('test').where({ foo: null });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, 'SELECT * FROM "test" WHERE "foo" IS null');
  });

  it('assert :: where starts with', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          startsWith: 'abc'
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, ['abc']);

    assert.equal(statement, `SELECT * FROM "test" WHERE "foo" LIKE :0 || '%'`);
  });

  it('assert :: where starts with (with insensitive)', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          startsWith: 'abc',
          insensitive: true
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, ['abc']);

    assert.equal(statement, `SELECT * FROM "test" WHERE "foo" ILIKE :0 || '%'`);
  });

  it('assert :: where contains', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          contains: 'abc'
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, ['abc']);

    assert.equal(statement, `SELECT * FROM "test" WHERE "foo" LIKE '%' || :0 || '%'`);
  });

  it('assert :: where contains (with insensitive)', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          contains: 'abc',
          insensitive: true
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, ['abc']);

    assert.equal(statement, `SELECT * FROM "test" WHERE "foo" ILIKE '%' || :0 || '%'`);
  });

  it('assert :: where multiple operators', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          gte: 123,
          lt: 456
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [123, 456]);

    assert.equal(statement, 'SELECT * FROM "test" WHERE ("foo" >= :0 AND "foo" < :1)');
  });

  it('assert :: where not', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        NOT: {
          foo: 123,
          bar: 'abc'
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [123, 'abc']);

    assert.equal(statement, 'SELECT * FROM "test" WHERE NOT ("foo" = :0 AND "bar" = :1)');
  });

  it('assert :: where and', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
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

    assert.equal(statement, 'SELECT * FROM "test" WHERE ("foo" = :0 AND "bar" = :1 AND ("baz" = :2 OR "qux" = :3))');
  });

  it('assert :: where or', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
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

    assert.equal(statement, 'SELECT * FROM "test" WHERE (("foo" = :0 AND "bar" = :1) OR ("baz" = :2 AND "qux" = :3))');
  });

  it('assert :: where with alias', ({ assert }) => {
    const query = sql.select().from('test').as('alias').where({
      foo: true
    });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [true]);

    assert.equal(statement, `SELECT * FROM "test" AS "alias" WHERE "alias"."foo" = :0`);
  });

  it('assert :: where with raw value', ({ assert }) => {
    const query = sql.select().from('test');

    query.where({
      foo: sql.rawValue(() => 'plain_foo'),
      bar: sql.rawValue('plain_bar')
    });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, `SELECT * FROM "test" WHERE "foo" = plain_foo AND "bar" = plain_bar`);
  });

  it('assert :: where with reference', ({ assert }) => {
    const query = sql.select().from('test');

    query.where({
      foo: {
        bar: {
          baz: query.reference('column')
        }
      }
    });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, `SELECT * FROM "test" WHERE "foo"['bar']['baz'] = "column"`);
  });

  it('assert :: where with exists', ({ assert }) => {
    const query = sql.select().from('test').as('alias_test');

    query.where({
      foo_condition: sql
        .select()
        .rawColumn(1)
        .from('another_table')
        .where({
          foo: query.reference('bar')
        })
    });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(
      statement,
      `SELECT * FROM "test" AS "alias_test" ` + `WHERE EXISTS (SELECT 1 FROM "another_table" WHERE "foo" = "alias_test"."bar")`
    );
  });

  it('assert :: where with not exists', ({ assert }) => {
    const query = sql.select().from('test').as('alias_test');

    query.where({
      NOT: {
        foo_condition: sql.select().rawColumn(1).from('another_table')
      }
    });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, `SELECT * FROM "test" AS "alias_test" WHERE NOT EXISTS (SELECT 1 FROM "another_table")`);
  });

  it('assert :: where empty', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          // Make where condition to be falsy.
          isIn: []
        },
        AND: [],
        OR: [],
        NOT: {}
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, `SELECT * FROM "test" WHERE false`);
  });

  it('assert :: where undefined', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: undefined,
        bar: {
          equal: undefined
        },
        baz: {
          qux: undefined
        },
        AND: [
          {
            foo: undefined
          },
          {}
        ],
        OR: [
          {
            bar: undefined
          },
          {}
        ],
        NOT: {
          baz: undefined
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, `SELECT * FROM "test"`);
  });
});
