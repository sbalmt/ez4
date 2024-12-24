import { describe, it } from 'node:test';
import { equal } from 'node:assert';

import { Sql } from '@ez4/pgsql';

describe.only('sql where tests', () => {
  it('assert :: where equal (implicit)', async () => {
    const query = Sql.select().where({
      foo: 'abc'
    });

    equal(query.toString(), 'WHERE "foo" = :0');
  });

  it('assert :: where equal (explicit)', async () => {
    const query = Sql.select().where({
      foo: {
        equal: 'abc'
      }
    });

    equal(query.toString(), 'WHERE "foo" = :0');
  });

  it('assert :: where not equal', async () => {
    const query = Sql.select().where({
      foo: {
        not: 123
      }
    });

    equal(query.toString(), 'WHERE "foo" != :0');
  });

  it('assert :: where greater than', async () => {
    const query = Sql.select().where({
      foo: {
        gt: 0
      }
    });

    equal(query.toString(), 'WHERE "foo" > :0');
  });

  it('assert :: where greater than or equal', async () => {
    const query = Sql.select().where({
      foo: {
        gte: 0
      }
    });

    equal(query.toString(), 'WHERE "foo" >= :0');
  });

  it('assert :: where less than', async () => {
    const query = Sql.select().where({
      foo: {
        lt: 0
      }
    });

    equal(query.toString(), 'WHERE "foo" < :0');
  });

  it('assert :: where less than or equal', async () => {
    const query = Sql.select().where({
      foo: {
        lte: 0
      }
    });

    equal(query.toString(), 'WHERE "foo" <= :0');
  });

  it('assert :: where is in', async () => {
    const query = Sql.select().where({
      foo: {
        isIn: [1, 2, 3]
      }
    });

    equal(query.toString(), 'WHERE "foo" IN (:0, :1, :2)');
  });

  it('assert :: where is between', async () => {
    const query = Sql.select().where({
      foo: {
        isBetween: [1, 2]
      }
    });

    equal(query.toString(), 'WHERE "foo" BETWEEN :0 AND :1');
  });

  it('assert :: where is missing', async () => {
    const query = Sql.select().where({
      foo: {
        isMissing: true
      }
    });

    equal(query.toString(), 'WHERE "foo" IS NULL');
  });

  it('assert :: where is not missing', async () => {
    const query = Sql.select().where({
      foo: {
        isMissing: false
      }
    });

    equal(query.toString(), 'WHERE "foo" IS NOT NULL');
  });

  it('assert :: where is null', async () => {
    const query = Sql.select().where({
      foo: {
        isNull: true
      }
    });

    equal(query.toString(), 'WHERE "foo" IS NULL');
  });

  it('assert :: where is not null', async () => {
    const query = Sql.select().where({
      foo: {
        isNull: false
      }
    });

    equal(query.toString(), 'WHERE "foo" IS NOT NULL');
  });

  it('assert :: where starts with', async () => {
    const query = Sql.select().where({
      foo: {
        startsWith: 'abc'
      }
    });

    equal(query.toString(), `WHERE "foo" LIKE :0 || '%'`);
  });

  it('assert :: where contains', async () => {
    const query = Sql.select().where({
      foo: {
        contains: 'abc'
      }
    });

    equal(query.toString(), `WHERE "foo" LIKE '%' || :0 || '%'`);
  });

  it('assert :: where not', async () => {
    const query = Sql.select().where({
      NOT: {
        foo: 123,
        bar: 'abc'
      }
    });

    equal(query.toString(), 'WHERE NOT ("foo" = :0 AND "bar" = :1)');
  });

  it('assert :: where and', async () => {
    const query = Sql.select().where({
      AND: [{ foo: 123, bar: 'abc' }, { OR: [{ baz: 456 }, { qux: 789 }] }]
    });

    equal(query.toString(), 'WHERE ("foo" = :0 AND "bar" = :1 AND ("baz" = :2 OR "qux" = :3))');
  });

  it('assert :: where or', async () => {
    const query = Sql.select().where({
      OR: [{ foo: 123, bar: 'abc' }, { AND: [{ baz: 456 }, { qux: 789 }] }]
    });

    equal(query.toString(), 'WHERE (("foo" = :0 AND "bar" = :1) OR ("baz" = :2 AND "qux" = :3))');
  });

  it('assert :: where with alias query', async () => {
    const query = Sql.select().as('alias').where({
      foo: true
    });

    equal(query.toString(), `WHERE "alias"."foo" = :0`);
  });

  it('assert :: where with nested fields', async () => {
    const query = Sql.select().where({
      foo: {
        bar: {
          baz: true
        }
      }
    });

    equal(query.toString(), `WHERE "foo"['bar']['baz'] = :0`);
  });
});
