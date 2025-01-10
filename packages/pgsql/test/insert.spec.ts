import { beforeEach, describe, it } from 'node:test';
import { equal, deepEqual } from 'node:assert';

import { SqlBuilder } from '@ez4/pgsql';

describe.only('sql insert tests', () => {
  let sql: SqlBuilder;

  beforeEach(() => {
    sql = new SqlBuilder();
  });

  it('assert :: insert with initial record', async () => {
    const query = sql.insert().into('table').record({
      foo: 123,
      bar: true,
      baz: 'abc'
    });

    deepEqual(query.fields, ['foo', 'bar', 'baz']);
    deepEqual(query.values, [123, true, 'abc']);

    const [statement, variables] = query.build();

    deepEqual(variables, [123, true, 'abc']);

    equal(statement, 'INSERT INTO "table" ("foo", "bar", "baz") VALUES (:0, :1, :2)');
  });

  it('assert :: insert with defined record', async () => {
    const query = sql.insert().into('table').record({
      foo: 'abc',
      bar: 123,
      baz: false
    });

    deepEqual(query.fields, ['foo', 'bar', 'baz']);
    deepEqual(query.values, ['abc', 123, false]);

    const [statement, variables] = query.build();

    deepEqual(variables, ['abc', 123, false]);

    equal(statement, 'INSERT INTO "table" ("foo", "bar", "baz") VALUES (:0, :1, :2)');
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

    equal(
      statement,
      'INSERT INTO "table1" ("foo", "bar") VALUES (:0, (SELECT "baz" FROM "table2"))'
    );
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
        bar: sql.raw(value)
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

    equal(
      statement,
      'INSERT INTO "table" AS "alias" DEFAULT VALUES RETURNING "alias"."foo", "alias"."bar"'
    );
  });
});
