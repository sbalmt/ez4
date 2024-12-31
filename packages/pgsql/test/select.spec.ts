import { beforeEach, describe, it } from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';

import { mergeSqlAlias, SqlBuilder } from '@ez4/pgsql';
import { Order } from '@ez4/database';

describe.only('sql select tests', () => {
  let sql: SqlBuilder;

  beforeEach(() => {
    sql = new SqlBuilder();
  });

  it('assert :: select all', async () => {
    const query = sql.select().from('table');

    deepEqual(query.fields, []);

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(statement, 'SELECT * FROM "table"');
  });

  it('assert :: select with extra columns', async () => {
    const query = sql.select(['foo', 'bar']).from('table');

    query.column('baz');

    deepEqual(query.fields, ['foo', 'bar', 'baz']);

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(statement, 'SELECT "foo", "bar", "baz" FROM "table"');
  });

  it('assert :: select with alias', async () => {
    const query = sql
      .select(['foo', ['bar', 'alias_bar']])
      .from('table')
      .as('alias_table');

    deepEqual(query.fields, ['foo', ['bar', 'alias_bar']]);

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(
      statement,
      'SELECT "alias_table"."foo", "alias_table"."bar" AS "alias_bar" FROM "table" AS "alias_table"'
    );
  });

  it('assert :: select with raw columns', async () => {
    const query = sql.select(['foo', 'bar']).as('alias').from('table');

    query.rawColumn((statement) => mergeSqlAlias('*', statement?.alias));

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(statement, `SELECT "alias"."foo", "alias"."bar", "alias".* FROM "table" AS "alias"`);
  });

  it('assert :: select with json object columns', async () => {
    const query = sql.select(['foo', 'bar']).as('alias').from('table');

    query.objectColumn(
      {
        bar: true,
        baz: {
          qux: true
        }
      },
      {
        column: 'json'
      }
    );

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(
      statement,
      `SELECT "alias"."foo", "alias"."bar", ` +
        `json_build_object(` +
        `'bar', "alias"."json"['bar'], ` +
        `'baz', json_build_object('qux', "alias"."json"['baz']['qux'])` +
        `) AS "json" ` +
        `FROM "table" AS "alias"`
    );
  });

  it('assert :: select with json array columns', async () => {
    const query = sql.select(['foo', 'bar']).as('alias').from('table');

    query.arrayColumn(
      {
        bar: true,
        baz: query.reference((statement) => mergeSqlAlias('column1', statement.alias)),
        qux: query.reference('column2')
      },
      {
        alias: 'json'
      }
    );

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(
      statement,
      `SELECT "alias"."foo", "alias"."bar", ` +
        `COALESCE(json_agg(json_build_object(` +
        `'bar', "alias"."bar", ` +
        `'baz', "alias".column1, ` +
        `'qux', "alias"."column2"` +
        `)), '[]'::json) AS "json" ` +
        `FROM "table" AS "alias"`
    );
  });

  it('assert :: select with inner select columns', async () => {
    const inner = sql.select(['bar']).from('inner').as('alias_bar').where({
      baz: 'abc'
    });

    const query = sql.select().from('table').columns('foo', inner);

    deepEqual(query.fields, ['foo', inner]);

    const [statement, variables] = query.build();

    deepEqual(variables, ['abc']);

    equal(
      statement,
      'SELECT "foo", (SELECT "T"."bar" FROM "inner" AS "T" WHERE "T"."baz" = :0) AS "alias_bar" FROM "table"'
    );
  });

  it('assert :: select with record columns', async () => {
    const query = sql.select().as('alias').from('table');

    query.record({
      id: true,
      foo: query.reference('foo'),
      bar: 'alias_bar',
      baz: sql.select(['name']).from('inner'),
      qux: {
        inner: true
      }
    });

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(
      statement,
      `SELECT ` +
        `"alias"."id", ` +
        `"alias"."foo", ` +
        `"alias"."bar" AS "alias_bar", ` +
        `(SELECT "name" FROM "inner") AS "baz", ` +
        `json_build_object('inner', "alias"."qux"['inner']) AS "qux" ` +
        `FROM "table" AS "alias"`
    );
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
      foo: 'abc'
    });

    const [statement, variables] = query.build();

    deepEqual(variables, ['abc']);

    equal(statement, 'SELECT * FROM "table" WHERE "foo" = :0');
  });
});
