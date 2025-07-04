import { beforeEach, describe, it } from 'node:test';
import { equal, deepEqual } from 'node:assert/strict';

import { mergeSqlAlias, SqlBuilder } from '@ez4/pgsql';
import { Order } from '@ez4/database';

describe('sql select tests', () => {
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
    const query = sql.select().columns('foo', 'bar').from('table');

    query.column('baz');

    deepEqual(query.fields, ['foo', 'bar', 'baz']);

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(statement, 'SELECT "foo", "bar", "baz" FROM "table"');
  });

  it('assert :: select with alias', async () => {
    const query = sql.select().columns('foo', ['bar', 'alias_bar']).from('table').as('alias_table');

    deepEqual(query.fields, ['foo', ['bar', 'alias_bar']]);

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(statement, 'SELECT "alias_table"."foo", "alias_table"."bar" AS "alias_bar" FROM "table" AS "alias_table"');
  });

  it('assert :: select with raw columns', async () => {
    const query = sql.select().columns('foo', 'bar').as('alias').from('table');

    query.rawColumn((source) => mergeSqlAlias('*', source?.alias));

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(statement, `SELECT "alias"."foo", "alias"."bar", "alias".* FROM "table" AS "alias"`);
  });

  it('assert :: select with json object columns', async () => {
    const query = sql.select().columns('foo', 'bar').as('alias').from('table');

    query.objectColumn(
      {
        foo: true,
        bar: {
          baz: sql.rawValue(() => 'plain_baz'),
          qux: sql.rawValue('plain_qux')
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
        `'foo', "alias"."json"['foo'], ` +
        `'bar', json_build_object(` +
        `'baz', plain_baz, ` +
        `'qux', plain_qux` +
        `)) AS "json" ` +
        `FROM "table" AS "alias"`
    );
  });

  it('assert :: select with json array columns', async () => {
    const query = sql.select().columns('foo', 'bar').as('alias').from('table');

    query.arrayColumn(
      {
        foo: true,
        bar: query.reference(({ alias }) => mergeSqlAlias('column1', alias)),
        baz: query.reference('column2')
      },
      {
        alias: 'json',
        order: {
          qux: Order.Desc
        }
      }
    );

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(
      statement,
      `SELECT "alias"."foo", "alias"."bar", ` +
        `COALESCE(json_agg(` +
        `json_build_object('foo', "alias"."foo", 'bar', "alias".column1, 'baz', "alias"."column2") ` +
        `ORDER BY "alias"."qux" DESC` +
        `), '[]'::json) AS "json" ` +
        `FROM "table" AS "alias"`
    );
  });

  it('assert :: select with inner select columns', async () => {
    const inner = sql.select().columns('bar').from('inner').as('alias').where({ baz: 'abc' }).take(1).order({
      bar: Order.Desc
    });

    const query = sql.select().from('table').columns('foo', inner);

    deepEqual(query.fields, ['foo', inner]);

    const [statement, variables] = query.build();

    deepEqual(variables, ['abc']);

    equal(
      statement,
      'SELECT "foo", (SELECT "T"."bar" FROM "inner" AS "T" WHERE "T"."baz" = :0 ORDER BY "T"."bar" DESC LIMIT 1) AS "alias" FROM "table"'
    );
  });

  it('assert :: select with record columns', async () => {
    const query = sql.select().as('alias').from('table');

    query.record({
      id: false, // Omitted
      foo: query.reference('foo'),
      bar: 'alias_bar',
      baz: sql.select().columns('foo').from('table2'),
      qux: {
        innerFoo: true,
        innerBar: sql.select().columns('foo').from('table3')
      }
    });

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(
      statement,
      `SELECT ` +
        `"alias"."foo", ` +
        `"alias"."bar" AS "alias_bar", ` +
        `(SELECT "foo" FROM "table2") AS "baz", ` +
        `json_build_object(` +
        `'innerFoo', "alias"."qux"['innerFoo'], ` +
        `'innerBar', (SELECT "foo" FROM "table3")` +
        `) AS "qux" ` +
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

  it('assert :: select with inner query', async () => {
    const inner = sql.select().columns('foo', 'bar').from('inner').as('alias').where({ baz: 'abc' }).take(1).order({
      qux: Order.Desc
    });

    const query = sql.select().columns('foo', inner.reference('bar')).from(inner);

    const [statement, variables] = query.build();

    deepEqual(variables, ['abc']);

    equal(
      statement,
      `SELECT "foo", "alias"."bar" FROM ` +
        `(SELECT "S"."foo", "S"."bar" FROM "inner" AS "S" WHERE "S"."baz" = :0 ORDER BY "S"."qux" DESC LIMIT 1) AS "alias"`
    );
  });

  it('assert :: select with inner join', async () => {
    const query = sql.select().from('table1').as('alias1').column('bar');

    const join = query
      .join('table2')
      .as('alias2')
      .on({
        foo: 'bar',
        baz: query.reference('qux')
      });

    query.column(join.reference('foo'));

    const [statement, variables] = query.build();

    deepEqual(variables, ['bar']);

    equal(
      statement,
      `SELECT "alias1"."bar", "alias2"."foo" ` +
        `FROM "table1" AS "alias1" ` +
        `INNER JOIN "table2" AS "alias2" ` +
        `ON "alias2"."foo" = :0 AND "alias2"."baz" = "alias1"."qux"`
    );
  });
});
