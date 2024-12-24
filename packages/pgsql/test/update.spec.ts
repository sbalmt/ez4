import { describe, it } from 'node:test';
import { equal, deepEqual } from 'node:assert';

import { Sql } from '@ez4/pgsql';

describe.only('sql update tests', () => {
  it('assert :: update with record', async () => {
    const query = Sql.update('table1', {
      foo: 123,
      bar: 'abc'
    });

    deepEqual(query.fields, ['foo', 'bar']);
    deepEqual(query.values, [123, 'abc']);

    equal(query.toString(), 'UPDATE ONLY "table1" SET "foo" = :0, "bar" = :1');

    // Reset query

    query.only('table2').record({
      foo: 'abc',
      bar: 123
    });

    deepEqual(query.fields, ['foo', 'bar']);
    deepEqual(query.values, ['abc', 123]);

    equal(query.toString(), 'UPDATE ONLY "table2" SET "foo" = :0, "bar" = :1');
  });

  it('assert :: update with sub-select record', async () => {
    const sub = Sql.select('foo').from('sub_table');

    const query = Sql.update().only('table').record({
      foo: 'abc',
      bar: sub
    });

    deepEqual(query.fields, ['foo', 'bar']);
    deepEqual(query.values, ['abc', sub]);

    equal(
      query.toString(),
      'UPDATE ONLY "table" SET "foo" = :0, "bar" = (SELECT "foo" FROM "sub_table")'
    );
  });

  it('assert :: update with returning', async () => {
    const query = Sql.update().only('table').returning('foo', 'bar').record({
      foo: true
    });

    equal(query.toString(), 'UPDATE ONLY "table" SET "foo" = :0 RETURNING "foo", "bar"');
  });

  it('assert :: update with alias', async () => {
    const query = Sql.update().only('table').as('alias').record({
      foo: true
    });

    equal(query.toString(), 'UPDATE ONLY "table" AS "alias" SET "foo" = :0');
  });

  it('assert :: update with where', async () => {
    const query = Sql.update().only('table').record({
      foo: true
    });

    query.where({
      id: 'abc'
    });

    equal(query.toString(), 'UPDATE ONLY "table" SET "foo" = :0 WHERE "id" = :1');
  });
});
