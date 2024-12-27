import { beforeEach, describe, it } from 'node:test';
import { equal, deepEqual } from 'node:assert';

import { SqlBuilder } from '@ez4/pgsql';

describe.only('sql insert tests', () => {
  let sql: SqlBuilder;

  beforeEach(() => {
    sql = new SqlBuilder();
  });

  it('assert :: insert with initial record', async () => {
    const query = sql.insert('table', {
      id: 123,
      foo: true,
      bar: 'abc'
    });

    deepEqual(query.fields, ['id', 'foo', 'bar']);
    deepEqual(query.values, [123, true, 'abc']);

    const [statement, variables] = query.build();

    deepEqual(variables, [123, true, 'abc']);

    equal(statement, 'INSERT INTO "table" ("id", "foo", "bar") VALUES (:0, :1, :2)');
  });

  it('assert :: insert with defined record', async () => {
    const query = sql.insert().into('table').record({
      id: 'abc',
      foo: 123,
      bar: false
    });

    deepEqual(query.fields, ['id', 'foo', 'bar']);
    deepEqual(query.values, ['abc', 123, false]);

    const [statement, variables] = query.build();

    deepEqual(variables, ['abc', 123, false]);

    equal(statement, 'INSERT INTO "table" ("id", "foo", "bar") VALUES (:0, :1, :2)');
  });

  it('assert :: insert with inner select record', async () => {
    const inner = sql.select('foo').from('sub_table');

    const query = sql.insert().into('table').record({
      id: 123,
      foo: inner
    });

    deepEqual(query.fields, ['id', 'foo']);
    deepEqual(query.values, [123, inner]);

    const [statement, variables] = query.build();

    deepEqual(variables, [123]);

    equal(
      statement,
      'INSERT INTO "table" ("id", "foo") VALUES (:0, (SELECT "foo" FROM "sub_table"))'
    );
  });

  it('assert :: insert with no record', async () => {
    const query = sql.insert().into('table');

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(statement, 'INSERT INTO "table" DEFAULT VALUES');
  });

  it('assert :: insert with returning', async () => {
    const query = sql.insert().into('table').returning('foo', 'bar');

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(statement, 'INSERT INTO "table" DEFAULT VALUES RETURNING "foo", "bar"');
  });

  it('assert :: insert with alias', async () => {
    const query = sql.insert().into('table').as('alias');

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(statement, 'INSERT INTO "table" AS "alias" DEFAULT VALUES');
  });
});
