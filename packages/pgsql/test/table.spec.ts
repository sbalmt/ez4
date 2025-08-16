import { beforeEach, describe, it } from 'node:test';
import { equal } from 'node:assert/strict';

import { SqlBuilder } from '@ez4/pgsql';

describe('sql table tests', () => {
  let sql: SqlBuilder;

  beforeEach(() => {
    sql = new SqlBuilder();
  });

  it('assert :: create table', () => {
    const query = sql.table('table').create().column('foo', 'boolean', true).column('bar', 'integer').column('baz', 'text');

    const statement = query.build();

    equal(statement, `CREATE TABLE "table" ("foo" boolean NOT null, "bar" integer, "baz" text)`);
  });

  it('assert :: create table (if not exists)', () => {
    const query = sql
      .table('table')
      .create()
      .missing()
      .column('foo', 'uuid', true)
      .column('bar', 'timestamptz', true, 'now()')
      .column('baz', 'text');

    const statement = query.build();

    equal(statement, `CREATE TABLE IF NOT EXISTS "table" ("foo" uuid NOT null, "bar" timestamptz DEFAULT now() NOT null, "baz" text)`);
  });

  it('assert :: rename table', () => {
    const query = sql.table('table').rename('renamed');

    const statement = query.build();

    equal(statement, `ALTER TABLE "table" RENAME TO "renamed"`);
  });

  it('assert :: drop table', () => {
    const query = sql.table('table').drop();

    const statement = query.build();

    equal(statement, `DROP TABLE "table"`);
  });

  it('assert :: drop table (if exists)', () => {
    const query = sql.table('table').drop().existing();

    const statement = query.build();

    equal(statement, `DROP TABLE IF EXISTS "table"`);
  });

  it('assert :: drop table (cascade)', () => {
    const query = sql.table('table').drop().cascade();

    const statement = query.build();

    equal(statement, `DROP TABLE "table" CASCADE`);
  });

  it('assert :: drop table (cascade, if exists)', () => {
    const query = sql.table('table').drop().existing().cascade();

    const statement = query.build();

    equal(statement, `DROP TABLE IF EXISTS "table" CASCADE`);
  });
});
