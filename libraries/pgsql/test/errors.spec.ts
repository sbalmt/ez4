import { describe, it } from 'node:test';

import {
  EmptyRecordError,
  InvalidColumnOrderError,
  InvalidWhereClauseError,
  MissingClauseError,
  MissingRecordError,
  MissingTableNameError,
  NoStatementsError,
  SqlBuilder,
  TooManyClausesError
} from '@ez4/pgsql';
import { Order } from '@ez4/database';

describe('sql error tests', () => {
  it('assert :: missing statement table', ({ assert }) => {
    const sql = new SqlBuilder();

    assert.throws(() => sql.insert().build(), MissingTableNameError);
    assert.throws(() => sql.update().build(), MissingTableNameError);
    assert.throws(() => sql.delete().build(), MissingTableNameError);
  });

  it('assert :: missing update record', ({ assert }) => {
    const sql = new SqlBuilder();

    assert.throws(() => sql.update().only('table').build(), MissingRecordError);
    assert.throws(() => sql.update().only('table').record({}).build(), EmptyRecordError);
  });

  it('assert :: invalid insert where clause', ({ assert }) => {
    const sql = new SqlBuilder();
    const query = sql.insert().into('table').where({ foo: 'bar' });

    assert.throws(() => query.build(), InvalidWhereClauseError);
  });

  it('assert :: missing and incompatible clauses', ({ assert }) => {
    const sql = new SqlBuilder();
    const table = sql.table('table');
    const index = sql.index('index');

    table.create();
    index.create('table');

    assert.throws(() => sql.table('table').alter().build(), MissingClauseError);
    assert.throws(() => table.drop(), TooManyClausesError);
    assert.throws(() => index.drop(), TooManyClausesError);
    assert.throws(() => sql.union([]).build(), NoStatementsError);
    assert.throws(() => sql.with([]).build(), NoStatementsError);
  });

  it('assert :: invalid order direction', ({ assert }) => {
    const sql = new SqlBuilder();
    const query = sql
      .select()
      .from('table')
      .order({ foo: 'invalid' as Order });

    assert.throws(() => query.build(), InvalidColumnOrderError);
  });
});
