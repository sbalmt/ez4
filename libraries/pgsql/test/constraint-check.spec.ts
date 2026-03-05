import { beforeEach, describe, it } from 'node:test';
import { equal } from 'node:assert/strict';

import { SqlBuilder } from '@ez4/pgsql';

describe('sql table check constraint tests', () => {
  let sql: SqlBuilder;

  beforeEach(() => {
    sql = new SqlBuilder();
  });

  it('assert :: add check constraint', () => {
    const query = sql.table('table').alter();

    query.constraint('foo').check({
      column: {
        isIn: ['a', 'b', 'c']
      }
    });

    const statement = query.build();

    equal(statement, `ALTER TABLE "table" ADD CONSTRAINT "foo" CHECK ("column" IN ('a', 'b', 'c'))`);
  });

  it('assert :: add check constraint (without validation)', () => {
    const query = sql.table('table').alter();

    const constraint = query.constraint('foo').check({
      column: {
        gt: 0,
        lt: 100
      }
    });

    constraint.validate(false);

    const statement = query.build();

    equal(statement, `ALTER TABLE "table" ADD CONSTRAINT "foo" CHECK (("column" > 0 AND "column" < 100)) NOT VALID`);
  });
});
