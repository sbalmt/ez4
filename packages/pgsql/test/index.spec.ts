import { beforeEach, describe, it } from 'node:test';
import { equal } from 'node:assert/strict';

import { SqlBuilder } from '@ez4/pgsql';

describe('sql index tests', () => {
  let sql: SqlBuilder;

  beforeEach(() => {
    sql = new SqlBuilder();
  });

  it('assert :: create index', () => {
    const query = sql.index('index').create('table').columns(['foo', 'bar']).column('baz');

    const statement = query.build();

    equal(statement, `CREATE INDEX "index" ON "table" ("foo", "bar", "baz")`);
  });

  it('assert :: create index (concurrently)', () => {
    const query = sql.index('index').create('table', ['foo', 'bar', 'baz']).concurrent();

    const statement = query.build();

    equal(statement, `CREATE INDEX CONCURRENTLY "index" ON "table" ("foo", "bar", "baz")`);
  });

  it('assert :: create index (if not exists)', () => {
    const query = sql.index('index').create('table', ['foo', 'bar', 'baz']).missing();

    const statement = query.build();

    equal(statement, `CREATE INDEX IF NOT EXISTS "index" ON "table" ("foo", "bar", "baz")`);
  });

  it('assert :: create index (using type)', () => {
    const query = sql.index('index').create('table', ['foo', 'bar', 'baz']).type('GIN');

    const statement = query.build();

    equal(statement, `CREATE INDEX "index" ON "table" USING GIN ("foo", "bar", "baz")`);
  });

  it('assert :: rename index', () => {
    const query = sql.index('index').rename('renamed');

    const statement = query.build();

    equal(statement, `ALTER INDEX "index" RENAME TO "renamed"`);
  });

  it('assert :: rename index (if exists)', () => {
    const query = sql.index('index').rename('renamed').existing();

    const statement = query.build();

    equal(statement, `ALTER INDEX IF EXISTS "index" RENAME TO "renamed"`);
  });

  it('assert :: drop index (concurrently)', () => {
    const query = sql.index('index').drop().concurrent();

    const statement = query.build();

    equal(statement, `DROP INDEX CONCURRENTLY "index"`);
  });

  it('assert :: drop index (if exists)', () => {
    const query = sql.index('index').drop().existing();

    const statement = query.build();

    equal(statement, `DROP INDEX IF EXISTS "index"`);
  });

  it('assert :: drop index', () => {
    const query = sql.index('index').drop();

    const statement = query.build();

    equal(statement, `DROP INDEX "index"`);
  });
});
