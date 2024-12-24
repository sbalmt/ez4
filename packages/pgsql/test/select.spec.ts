import { describe, it } from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';

import { Order } from '@ez4/database';
import { Sql } from '@ez4/pgsql';

describe.only('sql select tests', () => {
  it('assert :: select with columns', async () => {
    const query = Sql.select().from('table');

    deepEqual(query.fields, []);

    equal(query.toString(), 'SELECT * FROM "table"');

    // Reset query

    query.columns('id', 'foo', 'bar');

    deepEqual(query.fields, ['id', 'foo', 'bar']);

    equal(query.toString(), 'SELECT "id", "foo", "bar" FROM "table"');
  });

  it('assert :: select with sub-selects', async () => {
    const sub = Sql.select('name').from('sub_table').as('column_alias');

    const query = Sql.select().from('table').columns('id', sub);

    deepEqual(query.fields, ['id', sub]);

    equal(
      query.toString(),
      'SELECT "id", (SELECT "name" FROM "sub_table") AS "column_alias" FROM "table"'
    );
  });

  it('assert :: select with alias', async () => {
    const query = Sql.select('id', ['name', 'alias_name']).from('table').as('alias_table');

    deepEqual(query.fields, ['id', ['name', 'alias_name']]);

    equal(query.toString(), 'SELECT "id", "name" AS "alias_name" FROM "table" AS "alias_table"');
  });

  it('assert :: select with offset', async () => {
    const query = Sql.select().from('table').skip(100);

    equal(query.toString(), 'SELECT * FROM "table" OFFSET 100');
  });

  it('assert :: select with take', async () => {
    const query = Sql.select().from('table').take(100);

    equal(query.toString(), 'SELECT * FROM "table" LIMIT 100');
  });

  it('assert :: select with order', async () => {
    const query = Sql.select().from('table').order({
      foo: Order.Asc,
      bar: Order.Desc
    });

    equal(query.toString(), 'SELECT * FROM "table" ORDER BY "foo" ASC, "bar" DESC');
  });

  it('assert :: select with where', async () => {
    const query = Sql.select().from('table');

    query.where({
      id: 'abc'
    });

    equal(query.toString(), 'SELECT * FROM "table" WHERE "id" = :0');
  });
});
