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

  it('assert :: alter table (if exists, add columns)', () => {
    const query = sql.table('table').alter().existing();

    query.add('foo', 'boolean').default('false');
    query.add('bar', 'integer').missing();
    query.add('baz', 'text').required();
    query.add('qux', 'uuid');

    const statement = query.build();

    equal(
      statement,
      `ALTER TABLE IF EXISTS "table" ` +
        `ADD COLUMN "foo" boolean DEFAULT false, ` +
        `ADD COLUMN IF NOT EXISTS "bar" integer, ` +
        `ADD COLUMN "baz" text NOT null, ` +
        `ADD COLUMN "qux" uuid`
    );
  });

  it('assert :: alter table (add columns)', () => {
    const query = sql.table('table').alter();

    query.add('foo', 'boolean').default('true');
    query.add('baz', 'integer').required();
    query.add('bar', 'text').missing();
    query.add('qux', 'uuid');

    const statement = query.build();

    equal(
      statement,
      `ALTER TABLE "table" ` +
        `ADD COLUMN "foo" boolean DEFAULT true, ` +
        `ADD COLUMN "baz" integer NOT null, ` +
        `ADD COLUMN IF NOT EXISTS "bar" text, ` +
        `ADD COLUMN "qux" uuid`
    );
  });

  it('assert :: alter table (drop columns)', () => {
    const query = sql.table('table').alter();

    query.drop('foo');
    query.drop('bar').cascade();
    query.drop('baz').existing();
    query.drop('qux').existing().cascade();

    const statement = query.build();

    equal(
      statement,
      `ALTER TABLE "table" ` +
        `DROP COLUMN "foo", ` +
        `DROP COLUMN "bar" CASCADE, ` +
        `DROP COLUMN IF EXISTS "baz", ` +
        `DROP COLUMN IF EXISTS "qux" CASCADE`
    );
  });

  it('assert :: alter table (rename column)', () => {
    const query = sql.table('table').alter().rename('foo', 'bar');

    const statement = query.build();

    equal(statement, `ALTER TABLE "table" RENAME COLUMN "foo" TO "bar"`);
  });

  it('assert :: alter table (alter column type)', () => {
    const query = sql.table('table').alter();

    query.column('foo').type('boolean');
    query.column('bar').type('integer');
    query.column('baz').type('text');

    const statement = query.build();

    equal(
      statement,
      `ALTER TABLE "table" ` +
        `ALTER COLUMN "foo" TYPE boolean USING "foo"::boolean, ` +
        `ALTER COLUMN "bar" TYPE integer USING "bar"::integer, ` +
        `ALTER COLUMN "baz" TYPE text USING "baz"::text`
    );
  });

  it('assert :: alter table (alter nullable columns)', () => {
    const query = sql.table('table').alter();

    query.column('foo').required();
    query.column('bar').required(false);
    query.column('baz').required();

    const statement = query.build();

    equal(
      statement,
      `ALTER TABLE "table" ` +
        `ALTER COLUMN "foo" SET NOT null, ` +
        `ALTER COLUMN "bar" DROP NOT null, ` +
        `ALTER COLUMN "baz" SET NOT null`
    );
  });

  it('assert :: alter table (alter default columns)', () => {
    const query = sql.table('table').alter();

    query.column('foo').default("'hello world'");
    query.column('bar').default(null);
    query.column('baz').default('null');

    const statement = query.build();

    equal(
      statement,
      `ALTER TABLE "table" ` +
        `ALTER COLUMN "foo" SET DEFAULT 'hello world', ` +
        `ALTER COLUMN "bar" DROP DEFAULT, ` +
        `ALTER COLUMN "baz" SET DEFAULT null`
    );
  });
});
