import { beforeEach, describe, it } from 'node:test';
import { equal, deepEqual } from 'node:assert';

import { SqlBuilder } from '@ez4/pgsql';
import { Order } from '@ez4/database';

describe('sql insert tests', () => {
  let sql: SqlBuilder;

  beforeEach(() => {
    sql = new SqlBuilder();
  });

  it('assert :: insert with record', async () => {
    const query = sql.insert().into('table').record({
      foo: 123,
      bar: true,
      baz: 'abc',
      qux: undefined,
      xyz: null
    });

    deepEqual(query.fields, ['foo', 'bar', 'baz', 'xyz']);
    deepEqual(query.values, [123, true, 'abc', null]);

    const [statement, variables] = query.build();

    deepEqual(variables, [123, true, 'abc']);

    equal(statement, 'INSERT INTO "table" ("foo", "bar", "baz", "xyz") VALUES (:0, :1, :2, null)');
  });

  it('assert :: insert with json record', async () => {
    const query = sql
      .insert()
      .into('table')
      .record({
        foo: {
          bar: {
            baz: true
          }
        }
      });

    deepEqual(query.fields, ['foo']);
    deepEqual(query.values, [{ bar: { baz: true } }]);

    const [statement, variables] = query.build();

    deepEqual(variables, [{ bar: { baz: true } }]);

    equal(statement, 'INSERT INTO "table" ("foo") VALUES (:0)');
  });

  it('assert :: insert with nullable record', async () => {
    const query = sql.insert().into('table').record({
      foo: null
    });

    deepEqual(query.fields, ['foo']);
    deepEqual(query.values, [null]);

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(statement, 'INSERT INTO "table" ("foo") VALUES (null)');
  });

  it('assert :: insert with inner select record', async () => {
    const inner = sql.select().columns('baz').from('table2');

    const query = sql.insert().into('table1').record({
      foo: 123,
      bar: inner
    });

    deepEqual(query.fields, ['foo', 'bar']);
    deepEqual(query.values, [123, inner]);

    const [statement, variables] = query.build();

    deepEqual(variables, [123]);

    equal(statement, 'INSERT INTO "table1" ("foo", "bar") VALUES (:0, (SELECT "baz" FROM "table2"))');
  });

  it('assert :: insert with raw record value', async () => {
    const value = {
      baz: {
        qux: 'abc'
      }
    };

    const query = sql
      .insert()
      .into('table')
      .record({
        foo: 123,
        bar: sql.rawValue(value)
      });

    const [statement, variables] = query.build();

    deepEqual(variables, [123, value]);

    equal(statement, 'INSERT INTO "table" ("foo", "bar") VALUES (:0, :1)');
  });

  it('assert :: insert with no record', async () => {
    const query = sql.insert().into('table');

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(statement, 'INSERT INTO "table" DEFAULT VALUES');
  });

  it('assert :: insert with alias', async () => {
    const query = sql.insert().into('table').as('alias');

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(statement, 'INSERT INTO "table" AS "alias" DEFAULT VALUES');
  });

  it('assert :: insert with returning', async () => {
    const query = sql.insert().into('table').as('alias').returning(['foo', 'bar']);

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(statement, 'INSERT INTO "table" AS "alias" DEFAULT VALUES RETURNING "alias"."foo", "alias"."bar"');
  });

  it('assert :: insert with conflict (do nothing)', async () => {
    const query = sql.insert().into('table').as('alias').conflict(['foo', 'bar']).record({
      foo: 'abc',
      bar: true
    });

    const [statement, variables] = query.build();

    deepEqual(variables, ['abc', true]);

    equal(statement, `INSERT INTO "table" AS "alias" ("foo", "bar") VALUES (:0, :1) ON CONFLICT ("foo", "bar") DO NOTHING`);
  });

  it('assert :: insert with conflict (do update)', async () => {
    const query = sql
      .insert()
      .into('table')
      .as('alias')
      .conflict(['foo', 'bar'], {
        bar: false
      })
      .record({
        foo: 'abc',
        bar: true
      });

    const [statement, variables] = query.build();

    deepEqual(variables, ['abc', true, false]);

    equal(statement, `INSERT INTO "table" AS "alias" ("foo", "bar") VALUES (:0, :1) ON CONFLICT ("foo", "bar") DO UPDATE SET "bar" = :2`);
  });

  it('assert :: insert with select', async () => {
    const query = sql.insert().into('table').select().record({
      foo: 123,
      bar: 'abc',
      baz: true
    });

    const [statement, variables] = query.build();

    deepEqual(variables, [123, 'abc', true]);

    equal(statement, `INSERT INTO "table" ("foo", "bar", "baz") SELECT :0, :1, :2`);
  });

  it('assert :: insert with select where', async () => {
    const query = sql
      .insert()
      .into('table')
      .select()
      .record({
        foo: 'abc',
        bar: false
      })
      .where({
        baz: 123
      });

    const [statement, variables] = query.build();

    deepEqual(variables, ['abc', false, 123]);

    equal(statement, `INSERT INTO "table" ("foo", "bar") SELECT :0, :1 WHERE "baz" = :2`);
  });

  it('assert :: insert with select from', async () => {
    const inner = sql.select().columns('foo').from('inner').as('alias').where({ bar: 'abc' }).take(1).order({
      baz: Order.Desc
    });

    const query = sql
      .insert()
      .into('table')
      .as('outer')
      .select(inner)
      .record({
        qux: inner.reference('foo')
      });

    const [statement, variables] = query.build();

    deepEqual(variables, ['abc']);

    equal(
      statement,
      `INSERT INTO "table" AS "outer" ("qux") ` +
        `SELECT "alias"."foo" FROM ` +
        `(SELECT "S0"."foo" FROM "inner" AS "S0" WHERE "S0"."bar" = :0 ORDER BY "S0"."baz" DESC LIMIT 1) AS "alias"`
    );
  });

  it('assert :: insert with inner query', async () => {
    const inner = sql.select().columns('foo').from('inner').as('inner').where({ bar: 'abc' }).take(1).order({
      baz: Order.Desc
    });

    const query = sql
      .insert()
      .into('table')
      .select(inner)
      .as('outer')
      .record({
        qux: inner.reference('foo'),
        xyz: true
      });

    const [statement, variables] = query.build();

    deepEqual(variables, [true, 'abc']);

    equal(
      statement,
      `INSERT INTO "table" AS "outer" ("qux", "xyz") ` +
        `SELECT "inner"."foo", :0 FROM (` +
        `SELECT "S0"."foo" FROM "inner" AS "S0" WHERE "S0"."bar" = :1 ORDER BY "S0"."baz" DESC LIMIT 1` +
        `) AS "inner"`
    );
  });
});
