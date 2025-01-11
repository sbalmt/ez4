import { beforeEach, describe, it } from 'node:test';
import { deepEqual, equal } from 'node:assert';

import { SqlBuilder } from '@ez4/pgsql';

describe.only('sql where tests', () => {
  let sql: SqlBuilder;

  beforeEach(() => {
    sql = new SqlBuilder();
  });

  it('assert :: where no filters', async () => {
    const query = sql.select().from('test').where();

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(statement, `SELECT * FROM "test"`);
  });

  it('assert :: where equal (implicit)', async () => {
    const query = sql.select().from('test').where({
      foo: 'abc'
    });

    const [statement, variables] = query.build();

    deepEqual(variables, ['abc']);

    equal(statement, 'SELECT * FROM "test" WHERE "foo" = :0');
  });

  it('assert :: where equal (explicit)', async () => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          equal: 'abc'
        }
      });

    const [statement, variables] = query.build();

    deepEqual(variables, ['abc']);

    equal(statement, 'SELECT * FROM "test" WHERE "foo" = :0');
  });

  it('assert :: where not equal', async () => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          not: 123
        }
      });

    const [statement, variables] = query.build();

    deepEqual(variables, [123]);

    equal(statement, 'SELECT * FROM "test" WHERE "foo" != :0');
  });

  it('assert :: where greater than', async () => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          gt: 0
        }
      });

    const [statement, variables] = query.build();

    deepEqual(variables, [0]);

    equal(statement, 'SELECT * FROM "test" WHERE "foo" > :0');
  });

  it('assert :: where greater than or equal', async () => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          gte: 0
        }
      });

    const [statement, variables] = query.build();

    deepEqual(variables, [0]);

    equal(statement, 'SELECT * FROM "test" WHERE "foo" >= :0');
  });

  it('assert :: where less than', async () => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          lt: 0
        }
      });

    const [statement, variables] = query.build();

    deepEqual(variables, [0]);

    equal(statement, 'SELECT * FROM "test" WHERE "foo" < :0');
  });

  it('assert :: where less than or equal', async () => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          lte: 0
        }
      });

    const [statement, variables] = query.build();

    deepEqual(variables, [0]);

    equal(statement, 'SELECT * FROM "test" WHERE "foo" <= :0');
  });

  it('assert :: where is in', async () => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          isIn: [1, 2, 3]
        }
      });

    const [statement, variables] = query.build();

    deepEqual(variables, [1, 2, 3]);

    equal(statement, 'SELECT * FROM "test" WHERE "foo" IN (:0, :1, :2)');
  });

  it('assert :: where is between', async () => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          isBetween: [1, 2]
        }
      });

    const [statement, variables] = query.build();

    deepEqual(variables, [1, 2]);

    equal(statement, 'SELECT * FROM "test" WHERE "foo" BETWEEN :0 AND :1');
  });

  it('assert :: where is missing', async () => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          isMissing: true
        }
      });

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(statement, 'SELECT * FROM "test" WHERE "foo" IS NULL');
  });

  it('assert :: where is not missing', async () => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          isMissing: false
        }
      });

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(statement, 'SELECT * FROM "test" WHERE "foo" IS NOT NULL');
  });

  it('assert :: where is null (implicit)', async () => {
    const query = sql
      .select()
      .from('test')
      .where({ foo: null });

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(statement, 'SELECT * FROM "test" WHERE "foo" IS NULL');
  });

  it('assert :: where is null (explicit)', async () => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          isNull: true
        }
      });

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(statement, 'SELECT * FROM "test" WHERE "foo" IS NULL');
  });

  it('assert :: where is not null', async () => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          isNull: false
        }
      });

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(statement, 'SELECT * FROM "test" WHERE "foo" IS NOT NULL');
  });

  it('assert :: where starts with', async () => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          startsWith: 'abc'
        }
      });

    const [statement, variables] = query.build();

    deepEqual(variables, ['abc']);

    equal(statement, `SELECT * FROM "test" WHERE "foo" LIKE :0 || '%'`);
  });

  it('assert :: where contains', async () => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          contains: 'abc'
        }
      });

    const [statement, variables] = query.build();

    deepEqual(variables, ['abc']);

    equal(statement, `SELECT * FROM "test" WHERE "foo" LIKE '%' || :0 || '%'`);
  });

  it('assert :: where not', async () => {
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

    deepEqual(variables, [123, 'abc']);

    equal(statement, 'SELECT * FROM "test" WHERE NOT ("foo" = :0 AND "bar" = :1)');
  });

  it('assert :: where and', async () => {
    const query = sql
      .select()
      .from('test')
      .where({
        AND: [{ foo: 123, bar: 'abc' }, { OR: [{ baz: 456 }, { qux: 789 }] }]
      });

    const [statement, variables] = query.build();

    deepEqual(variables, [123, 'abc', 456, 789]);

    equal(
      statement,
      'SELECT * FROM "test" WHERE ("foo" = :0 AND "bar" = :1 AND ("baz" = :2 OR "qux" = :3))'
    );
  });

  it('assert :: where or', async () => {
    const query = sql
      .select()
      .from('test')
      .where({
        OR: [{ foo: 123, bar: 'abc' }, { AND: [{ baz: 456 }, { qux: 789 }] }]
      });

    const [statement, variables] = query.build();

    deepEqual(variables, [123, 'abc', 456, 789]);

    equal(
      statement,
      'SELECT * FROM "test" WHERE (("foo" = :0 AND "bar" = :1) OR ("baz" = :2 AND "qux" = :3))'
    );
  });

  it('assert :: where with alias', async () => {
    const query = sql.select().from('test').as('alias').where({
      foo: true
    });

    const [statement, variables] = query.build();

    deepEqual(variables, [true]);

    equal(statement, `SELECT * FROM "test" AS "alias" WHERE "alias"."foo" = :0`);
  });

  it('assert :: where with nested fields', async () => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          bar: {
            baz: true
          }
        }
      });

    const [statement, variables] = query.build();

    deepEqual(variables, [true]);

    equal(statement, `SELECT * FROM "test" WHERE "foo"['bar']['baz'] = :0`);
  });

  it('assert :: where with raw value', async () => {
    const query = sql.select().from('test');

    query.where({
      foo: sql.raw(() => 'plain_foo'),
      bar: sql.raw('plain_bar')
    });

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(statement, `SELECT * FROM "test" WHERE "foo" = plain_foo AND "bar" = plain_bar`);
  });

  it('assert :: where with reference', async () => {
    const query = sql.select().from('test');

    query.where({
      foo: {
        bar: {
          baz: query.reference('column')
        }
      }
    });

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(statement, `SELECT * FROM "test" WHERE "foo"['bar']['baz'] = "column"`);
  });
});
