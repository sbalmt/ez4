import { beforeEach, describe, it } from 'node:test';
import { deepEqual, equal } from 'node:assert';

import { SqlBuilder } from '@ez4/pgsql';

describe.only('sql with tests', () => {
  let sql: SqlBuilder;

  beforeEach(() => {
    sql = new SqlBuilder();
  });

  it('assert :: with single select', async () => {
    const query = sql.select().from('table');

    const [statement, variables] = sql.with([query]).build();

    deepEqual(variables, []);

    equal(statement, `SELECT * FROM "table"`);
  });

  it('assert :: with multiple selects', async () => {
    const query1 = sql.select().from('table1');

    const query2 = sql.select().from('table2').column(query1.reference('foo'));

    const [statement, variables] = sql.with([query1, query2]).build();

    deepEqual(variables, []);

    equal(statement, `WITH "R0" AS (SELECT * FROM "table1") SELECT "R0"."foo" FROM "table2"`);
  });

  it('assert :: with single insert', async () => {
    const query1 = sql.select().columns('foo').from('table1');

    const query2 = sql
      .insert()
      .into('table2')
      .select(query1)
      .record({
        foo: query1.reference('foo'),
        bar: 123
      });

    const [statement, variables] = sql.with([query1, query2]).build();

    deepEqual(variables, [123]);

    equal(
      statement,
      `WITH "R0" AS (SELECT "foo" FROM "table1") ` +
        `INSERT INTO "table2" ("foo", "bar") SELECT "R0"."foo", :0 FROM "R0"`
    );
  });

  it('assert :: with multiple inserts', async () => {
    const query1 = sql.insert().into('table1').record({ foo: 'abc' }).returning(['foo']);

    const query2 = sql
      .insert()
      .into('table2')
      .select(query1)
      .record({
        bar: query1.reference('foo'),
        baz: 'def'
      });

    const [statement, variables] = sql.with([query1, query2]).build();

    deepEqual(variables, ['abc', 'def']);

    equal(
      statement,
      `WITH "R0" AS (INSERT INTO "table1" ("foo") VALUES (:0) RETURNING "foo") ` +
        `INSERT INTO "table2" ("bar", "baz") SELECT "R0"."foo", :1 FROM "R0"`
    );
  });

  it('assert :: with single update', async () => {
    const query1 = sql.select().columns('foo').from('table1');

    const query2 = sql
      .update()
      .only('table2')
      .from(query1)
      .record({
        foo: query1.reference('foo'),
        bar: 123
      });

    const [statement, variables] = sql.with([query1, query2]).build();

    deepEqual(variables, [123]);

    equal(
      statement,
      `WITH "R0" AS (SELECT "foo" FROM "table1") ` +
        `UPDATE ONLY "table2" SET "foo" = "R0"."foo", "bar" = :0 FROM "R0"`
    );
  });

  it('assert :: with multiple updates', async () => {
    const query1 = sql.update().only('table1').returning(['foo']).record({
      foo: 'abc'
    });

    const query2 = sql
      .update()
      .only('table2')
      .from(query1)
      .record({
        bar: query1.reference('foo'),
        baz: 'def'
      });

    const [statement, variables] = sql.with([query1, query2]).build();

    deepEqual(variables, ['abc', 'def']);

    equal(
      statement,
      `WITH "R0" AS (UPDATE ONLY "table1" SET "foo" = :0 RETURNING "foo") ` +
        `UPDATE ONLY "table2" SET "bar" = "R0"."foo", "baz" = :1 FROM "R0"`
    );
  });
});
