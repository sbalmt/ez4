import { beforeEach, describe, it } from 'node:test';
import { deepEqual, equal } from 'node:assert';

import { SqlBuilder } from '@ez4/pgsql';

describe('sql union tests', () => {
  let sql: SqlBuilder;

  beforeEach(() => {
    sql = new SqlBuilder();
  });

  it('assert :: union single select', async () => {
    const query = sql.select().from('table');

    const [statement, variables] = sql.union([query]).build();

    deepEqual(variables, []);

    equal(statement, `SELECT * FROM "table"`);
  });

  it('assert :: union multiple selects', async () => {
    const query1 = sql.select().from('table1');
    const query2 = sql.select().from('table2');

    const [statement, variables] = sql.union([query1, query2]).build();

    deepEqual(variables, []);

    equal(statement, `SELECT * FROM "table1" UNION ALL SELECT * FROM "table2"`);
  });

  it('assert :: union single insert', async () => {
    const query = sql.insert().into('table').returning(['foo']).record({
      foo: 'foo',
      bar: 123
    });

    const [statement, variables] = sql.union([query]).build();

    deepEqual(variables, ['foo', 123]);

    equal(statement, `INSERT INTO "table" ("foo", "bar") VALUES (:0, :1) RETURNING "foo"`);
  });

  it('assert :: union multiple inserts', async () => {
    const query1 = sql.insert().into('table1').returning(['foo']).record({
      foo: 'abc'
    });

    const query2 = sql.insert().into('table2').returning(['bar']).record({
      bar: 'def'
    });

    const [statement, variables] = sql.union([query1, query2]).build();

    deepEqual(variables, ['abc', 'def']);

    equal(
      statement,
      `INSERT INTO "table1" ("foo") VALUES (:0) RETURNING "foo" ` +
        //
        `UNION ALL ` +
        `INSERT INTO "table2" ("bar") VALUES (:1) RETURNING "bar"`
    );
  });

  it('assert :: union single update', async () => {
    const query = sql.update().only('table').returning(['foo']).record({
      foo: 'foo',
      bar: 123
    });

    const [statement, variables] = sql.union([query]).build();

    deepEqual(variables, ['foo', 123]);

    equal(statement, `UPDATE ONLY "table" SET "foo" = :0, "bar" = :1 RETURNING "foo"`);
  });

  it('assert :: union multiple updates', async () => {
    const query1 = sql.update().only('table1').returning(['foo']).record({
      foo: 'abc'
    });

    const query2 = sql.update().only('table2').returning(['bar']).record({
      bar: 'def'
    });

    const [statement, variables] = sql.union([query1, query2]).build();

    deepEqual(variables, ['abc', 'def']);

    equal(
      statement,
      `UPDATE ONLY "table1" SET "foo" = :0 RETURNING "foo" ` +
        //
        `UNION ALL ` +
        `UPDATE ONLY "table2" SET "bar" = :1 RETURNING "bar"`
    );
  });
});
