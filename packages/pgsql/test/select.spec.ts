import { beforeEach, describe, it } from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';

import { Order } from '@ez4/database';
import { SqlBuilder } from '@ez4/pgsql';

describe.only('sql select tests', () => {
  let sql: SqlBuilder;

  beforeEach(() => {
    sql = new SqlBuilder();
  });

  it('assert :: select with no columns', async () => {
    const query = sql.select().from('table');

    deepEqual(query.fields, []);

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(statement, 'SELECT * FROM "table"');
  });

  it('assert :: select with extra columns', async () => {
    const query = sql.select('id', 'foo').from('table');

    query.column('bar');

    deepEqual(query.fields, ['id', 'foo', 'bar']);

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(statement, 'SELECT "id", "foo", "bar" FROM "table"');
  });

  it('assert :: select with json object columns', async () => {
    const query = sql.select('id', 'foo').as('alias').from('table');

    query.objectColumn(
      {
        bar: true,
        baz: {
          qux: true
        }
      },
      'bar'
    );

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(
      statement,
      `SELECT "id", "foo", ` +
        `json_build_object(` +
        `'bar', "alias"."bar", ` +
        `'baz', json_build_object('qux', "alias"."baz"['qux'])` +
        `) AS "bar" ` +
        `FROM "table" AS "alias"`
    );
  });

  it('assert :: select with json array columns', async () => {
    const query = sql.select('id', 'foo').as('alias').from('table');

    query.arrayColumn({ baz: true }, 'bar');

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(
      statement,
      `SELECT "id", "foo", ` +
        `COALESCE(json_agg(json_build_object('baz', "alias"."baz")), '[]'::json) AS "bar" ` +
        `FROM "table" AS "alias"`
    );
  });

  it('assert :: select with inner select columns', async () => {
    const inner = sql.select('name').from('inner').as('column_alias').where({
      foo: 'abc'
    });

    const query = sql.select().from('table').columns('id', inner);

    deepEqual(query.fields, ['id', inner]);

    const [statement, variables] = query.build();

    deepEqual(variables, ['abc']);

    equal(
      statement,
      'SELECT "id", (SELECT "name" FROM "inner" AS "T" WHERE "T"."foo" = :0) AS "column_alias" FROM "table"'
    );
  });

  it('assert :: select with alias', async () => {
    const query = sql.select('id', ['name', 'alias_name']).from('table').as('alias_table');

    deepEqual(query.fields, ['id', ['name', 'alias_name']]);

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(statement, 'SELECT "id", "name" AS "alias_name" FROM "table" AS "alias_table"');
  });

  it('assert :: select with offset', async () => {
    const query = sql.select().from('table').skip(100);

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(statement, 'SELECT * FROM "table" OFFSET 100');
  });

  it('assert :: select with limit', async () => {
    const query = sql.select().from('table').take(100);

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(statement, 'SELECT * FROM "table" LIMIT 100');
  });

  it('assert :: select with order', async () => {
    const query = sql.select().from('table').order({
      foo: Order.Asc,
      bar: Order.Desc
    });

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(statement, 'SELECT * FROM "table" ORDER BY "foo" ASC, "bar" DESC');
  });

  it('assert :: select with where', async () => {
    const query = sql.select().from('table').where({
      id: 'abc'
    });

    const [statement, variables] = query.build();

    deepEqual(variables, ['abc']);

    equal(statement, 'SELECT * FROM "table" WHERE "id" = :0');
  });

  it('assert :: select with where (column reference)', async () => {
    const query = sql.select().from('table');

    const reference = query.reference('column');

    equal(reference.toString(), '"column"');
  });

  it('assert :: select with where (aliased column reference)', async () => {
    const query = sql.select().from('table').as('alias');

    const reference = query.reference('column');

    equal(reference.toString(), '"alias"."column"');
  });
});
