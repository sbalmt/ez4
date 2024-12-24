import { describe, it } from 'node:test';
import { equal, deepEqual } from 'node:assert';

import { Sql } from '@ez4/pgsql';

describe.only('sql insert tests', () => {
  it('assert :: insert with record', async () => {
    const query = Sql.insert('table1', {
      id: 123,
      foo: true,
      bar: 'abc'
    });

    deepEqual(query.fields, ['id', 'foo', 'bar']);
    deepEqual(query.values, [123, true, 'abc']);

    equal(query.toString(), 'INSERT INTO "table1" ("id", "foo", "bar") VALUES (:0, :1, :2)');

    // Reset query

    query.into('table2').record({
      id: 'abc',
      foo: 123
    });

    deepEqual(query.fields, ['id', 'foo']);
    deepEqual(query.values, ['abc', 123]);

    equal(query.toString(), 'INSERT INTO "table2" ("id", "foo") VALUES (:0, :1)');
  });

  it('assert :: insert with sub-select record', async () => {
    const sub = Sql.select('foo').from('sub_table');

    const query = Sql.insert().into('table').record({
      id: 123,
      foo: sub
    });

    deepEqual(query.fields, ['id', 'foo']);
    deepEqual(query.values, [123, sub]);

    equal(
      query.toString(),
      'INSERT INTO "table" ("id", "foo") VALUES (:0, (SELECT "foo" FROM "sub_table"))'
    );
  });

  it('assert :: insert with no record', async () => {
    const query = Sql.insert().into('table');

    equal(query.toString(), 'INSERT INTO "table" DEFAULT VALUES');
  });

  it('assert :: insert with returning', async () => {
    const query = Sql.insert().into('table').returning('foo', 'bar');

    equal(query.toString(), 'INSERT INTO "table" DEFAULT VALUES RETURNING "foo", "bar"');
  });

  it('assert :: insert with alias', async () => {
    const query = Sql.insert().into('table').as('alias');

    equal(query.toString(), 'INSERT INTO "table" AS "alias" DEFAULT VALUES');
  });
});
