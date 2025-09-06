import { beforeEach, describe, it } from 'node:test';

import { SqlBuilder } from '@ez4/pgsql';

describe('sql where null tests', () => {
  let sql: SqlBuilder;

  beforeEach(() => {
    sql = new SqlBuilder();
  });

  it('assert :: where is null (implicit)', ({ assert }) => {
    const query = sql.select().from('test').where({
      foo: null
    });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, 'SELECT * FROM "test" WHERE "foo" IS null');
  });

  it('assert :: where is null (explicit)', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          equal: null
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, 'SELECT * FROM "test" WHERE "foo" IS null');
  });

  it('assert :: where is null (operator)', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          isNull: true
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, 'SELECT * FROM "test" WHERE "foo" IS null');
  });

  it('assert :: where is not null (explicit)', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          not: null
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, 'SELECT * FROM "test" WHERE "foo" IS NOT null');
  });

  it('assert :: where is not null (operator)', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          isNull: false
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, 'SELECT * FROM "test" WHERE "foo" IS NOT null');
  });
});
