import { beforeEach, describe, it } from 'node:test';
import { equal } from 'node:assert/strict';

import { SqlBuilder } from '@ez4/pgsql';

describe('sql table unique constraint tests', () => {
  let sql: SqlBuilder;

  beforeEach(() => {
    sql = new SqlBuilder();
  });

  it('assert :: add unique constraint', () => {
    const query = sql.table('table').alter();

    query.constraint('foo').unique(['bar', 'baz']);

    const statement = query.build();

    equal(statement, `ALTER TABLE "table" ADD CONSTRAINT "foo" UNIQUE ("bar", "baz")`);
  });

  it('assert :: add unique constraint (change columns)', () => {
    const query = sql.table('table').alter();

    const constraint = query.constraint('foo').unique(['bar', 'baz']);

    constraint.columns(['bar', 'qux']);

    const statement = query.build();

    equal(statement, `ALTER TABLE "table" ADD CONSTRAINT "foo" UNIQUE ("bar", "qux")`);
  });

  it('assert :: add unique constraint (without validation)', () => {
    const query = sql.table('table').alter();

    const constraint = query.constraint('foo').unique(['bar', 'baz']);

    constraint.validate(false);

    const statement = query.build();

    equal(statement, `ALTER TABLE "table" ADD CONSTRAINT "foo" UNIQUE ("bar", "baz") NOT VALID`);
  });
});
