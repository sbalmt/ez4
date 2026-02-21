import { beforeEach, describe, it } from 'node:test';
import { equal } from 'node:assert/strict';

import { SqlBuilder } from '@ez4/pgsql';

describe('sql table drop constraint tests', () => {
  let sql: SqlBuilder;

  beforeEach(() => {
    sql = new SqlBuilder();
  });

  it('assert :: drop constraints', () => {
    const query = sql.table('table').alter();

    query.constraint('foo').drop();
    query.constraint('bar').drop();

    const statement = query.build();

    equal(statement, `ALTER TABLE "table" DROP CONSTRAINT "foo", DROP CONSTRAINT "bar"`);
  });

  it('assert :: drop constraint (existing)', () => {
    const query = sql.table('table').alter();

    query.constraint('foo').drop().existing();

    const statement = query.build();

    equal(statement, `ALTER TABLE "table" DROP CONSTRAINT IF EXISTS "foo"`);
  });
});
