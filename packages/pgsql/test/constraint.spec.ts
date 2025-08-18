import { beforeEach, describe, it } from 'node:test';
import { equal } from 'node:assert/strict';

import { SqlBuilder } from '@ez4/pgsql';

describe('sql table constraint tests', () => {
  let sql: SqlBuilder;

  beforeEach(() => {
    sql = new SqlBuilder();
  });

  it('assert :: alter table (add foreign key constraint)', () => {
    const query = sql.table('table').alter();

    const constraintA = query.constraint('foo').foreign('relation_id', 'table', ['foo_bar', 'foo_baz', 'foo_qux']);
    const constraintB = query.constraint('bar').foreign('relation_id', 'table', ['bar_bar', 'bar_baz', 'bar_qux']);

    constraintA.delete().restrict();
    constraintA.update().null();

    constraintB.delete().cascade();

    const statement = query.build();

    equal(
      statement,
      `ALTER TABLE "table" ` +
        `ADD CONSTRAINT "foo" FOREIGN KEY ("relation_id") ` +
        `REFERENCES "table" ("foo_bar", "foo_baz", "foo_qux") ` +
        `ON DELETE RESTRICT ` +
        `ON UPDATE SET null, ` +
        //
        `ADD CONSTRAINT "bar" FOREIGN KEY ("relation_id") ` +
        `REFERENCES "table" ("bar_bar", "bar_baz", "bar_qux") ` +
        `ON DELETE CASCADE`
    );
  });

  it('assert :: alter table (add primary key constraint)', () => {
    const query = sql.table('table').alter();

    query.constraint('foo').primary(['foo_bar', 'foo_baz', 'foo_qux']);
    query.constraint('bar').primary(['bar_bar', 'bar_baz', 'bar_qux']);

    const statement = query.build();

    equal(
      statement,
      `ALTER TABLE "table" ` +
        `ADD CONSTRAINT "foo" PRIMARY KEY ("foo_bar", "foo_baz", "foo_qux"), ` +
        `ADD CONSTRAINT "bar" PRIMARY KEY ("bar_bar", "bar_baz", "bar_qux")`
    );
  });

  it('assert :: alter table (add unique constraint)', () => {
    const query = sql.table('table').alter();

    query.constraint('foo').unique(['foo_bar', 'foo_baz', 'foo_qux']);
    query.constraint('bar').unique(['bar_bar', 'bar_baz', 'bar_qux']);

    const statement = query.build();

    equal(
      statement,
      `ALTER TABLE "table" ` +
        `ADD CONSTRAINT "foo" UNIQUE ("foo_bar", "foo_baz", "foo_qux"), ` +
        `ADD CONSTRAINT "bar" UNIQUE ("bar_bar", "bar_baz", "bar_qux")`
    );
  });

  it('assert :: alter table (rename constraints)', () => {
    const query = sql.table('table').alter().constraint('foo').rename('bar');

    const statement = query.build();

    equal(statement, `ALTER TABLE "table" RENAME CONSTRAINT "foo" TO "bar"`);
  });

  it('assert :: alter table (drop constraints)', () => {
    const query = sql.table('table').alter();

    query.constraint('foo').drop();
    query.constraint('bar').drop().existing();
    query.constraint('baz').drop();

    const statement = query.build();

    equal(statement, `ALTER TABLE "table" DROP CONSTRAINT "foo", DROP CONSTRAINT IF EXISTS "bar", DROP CONSTRAINT "baz"`);
  });
});
