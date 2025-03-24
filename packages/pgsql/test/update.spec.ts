import { beforeEach, describe, it } from 'node:test';
import { equal, deepEqual } from 'node:assert';

import { SqlBuilder } from '@ez4/pgsql';

describe('sql update tests', () => {
  let sql: SqlBuilder;

  beforeEach(() => {
    sql = new SqlBuilder();
  });

  it('assert :: update with record', async () => {
    const query = sql.update().only('table').record({
      foo: 123,
      bar: 'abc',
      baz: undefined
    });

    deepEqual(query.fields, ['foo', 'bar']);
    deepEqual(query.values, [123, 'abc']);

    const [statement, variables] = query.build();

    deepEqual(variables, [123, 'abc']);

    equal(statement, 'UPDATE ONLY "table" SET "foo" = :0, "bar" = :1');
  });

  it('assert :: update with json record', async () => {
    const query = sql
      .update()
      .only('table')
      .record({
        foo: {
          bar: {
            baz: true
          }
        }
      });

    deepEqual(query.fields, ['foo']);

    deepEqual(query.values, [
      {
        bar: {
          baz: true
        }
      }
    ]);

    const [statement, variables] = query.build();

    deepEqual(variables, [true]);

    equal(statement, `UPDATE ONLY "table" SET "foo"['bar']['baz'] = :0`);
  });

  it('assert :: update with inner select record', async () => {
    const inner = sql.select().columns('baz').from('table2').where({
      qux: true
    });

    const query = sql.update().only('table1').record({
      foo: 'abc',
      bar: inner
    });

    deepEqual(query.fields, ['foo', 'bar']);
    deepEqual(query.values, ['abc', inner]);

    const [statement, variables] = query.build();

    deepEqual(variables, ['abc', true]);

    equal(statement, 'UPDATE ONLY "table1" SET "foo" = :0, "bar" = (SELECT "baz" FROM "table2" WHERE "qux" = :1)');
  });

  it('assert :: update with raw record value', async () => {
    const value = {
      baz: {
        qux: 'abc'
      }
    };

    const query = sql
      .update()
      .only('table')
      .record({
        foo: 123,
        bar: sql.rawValue(value)
      });

    const [statement, variables] = query.build();

    deepEqual(variables, [123, value]);

    equal(statement, 'UPDATE ONLY "table" SET "foo" = :0, "bar" = :1');
  });

  it('assert :: update with raw record operation', async () => {
    const query = sql
      .update()
      .only('table')
      .record({
        foo: 123,
        bar: sql.rawOperation('+', 456)
      });

    const [statement, variables] = query.build();

    deepEqual(variables, [123, 456]);

    equal(statement, 'UPDATE ONLY "table" SET "foo" = :0, "bar" = ("bar" + :1)');
  });

  it('assert :: update with alias', async () => {
    const query = sql.update().only('table').as('alias').record({
      foo: true
    });

    const [statement, variables] = query.build();

    deepEqual(variables, [true]);

    equal(statement, 'UPDATE ONLY "table" AS "alias" SET "foo" = :0');
  });

  it('assert :: update with returning', async () => {
    const query = sql.update().only('table').as('alias').returning(['foo', 'bar']).record({
      foo: true
    });

    const [statement, variables] = query.build();

    deepEqual(variables, [true]);

    equal(statement, 'UPDATE ONLY "table" AS "alias" SET "foo" = :0 RETURNING "alias"."foo", "alias"."bar"');
  });

  it('assert :: update with where', async () => {
    const query = sql
      .update()
      .only('table')
      .record({
        foo: true
      })
      .where({
        bar: 'abc'
      });

    const [statement, variables] = query.build();

    deepEqual(variables, [true, 'abc']);

    equal(statement, 'UPDATE ONLY "table" SET "foo" = :0 WHERE "bar" = :1');
  });
});
