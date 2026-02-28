import { beforeEach, describe, it } from 'node:test';
import { equal } from 'node:assert/strict';

import { SqlBuilder } from '@ez4/pgsql';

describe('sql table rename constraint tests', () => {
  let sql: SqlBuilder;

  beforeEach(() => {
    sql = new SqlBuilder();
  });

  it('assert :: rename constraint', () => {
    const query = sql.table('table').alter().constraint('foo').rename('bar');

    const statement = query.build();

    equal(statement, `ALTER TABLE "table" RENAME CONSTRAINT "foo" TO "bar"`);
  });

  it('assert :: rename constraint (change name)', () => {
    const query = sql.table('table').alter();

    const constraint = query.constraint('foo').rename('bar');

    constraint.to('baz');

    const statement = query.build();

    equal(statement, `ALTER TABLE "table" RENAME CONSTRAINT "foo" TO "baz"`);
  });
});
