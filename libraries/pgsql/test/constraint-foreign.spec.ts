import { beforeEach, describe, it } from 'node:test';
import { equal } from 'node:assert/strict';

import { SqlBuilder } from '@ez4/pgsql';

describe('sql table foreign constraint tests', () => {
  let sql: SqlBuilder;

  beforeEach(() => {
    sql = new SqlBuilder();
  });

  it('assert :: add foreign key', () => {
    const query = sql.table('table').alter();

    query.constraint('foo').foreign('relation_id', 'table', ['bar', 'baz']);

    const statement = query.build();

    equal(statement, `ALTER TABLE "table" ADD CONSTRAINT "foo" FOREIGN KEY ("relation_id") REFERENCES "table" ("bar", "baz")`);
  });

  it('assert :: add foreign key (change columns)', () => {
    const query = sql.table('table').alter();

    const constraint = query.constraint('foo').foreign('relation_id', 'table', ['bar', 'baz']);

    constraint.columns(['bar', 'qux']);

    const statement = query.build();

    equal(statement, `ALTER TABLE "table" ADD CONSTRAINT "foo" FOREIGN KEY ("relation_id") REFERENCES "table" ("bar", "qux")`);
  });

  it('assert :: add foreign key (without validation)', () => {
    const query = sql.table('table').alter();

    const constraint = query.constraint('foo').foreign('relation_id', 'table', ['bar', 'baz']);

    constraint.validate(false);

    const statement = query.build();

    equal(statement, `ALTER TABLE "table" ADD CONSTRAINT "foo" FOREIGN KEY ("relation_id") REFERENCES "table" ("bar", "baz") NOT VALID`);
  });

  it('assert :: add foreign key (change source table)', () => {
    const query = sql.table('table').alter();

    const constraint = query.constraint('foo').foreign('relation_id', 'table', ['bar', 'baz']);

    constraint.source('another_table');

    const statement = query.build();

    equal(statement, `ALTER TABLE "table" ADD CONSTRAINT "foo" FOREIGN KEY ("relation_id") REFERENCES "another_table" ("bar", "baz")`);
  });

  it('assert :: add foreign key (change target column)', () => {
    const query = sql.table('table').alter();

    const constraint = query.constraint('foo').foreign('relation_id', 'table', ['bar', 'baz']);

    constraint.target('another_relation_id');

    const statement = query.build();

    equal(statement, `ALTER TABLE "table" ADD CONSTRAINT "foo" FOREIGN KEY ("another_relation_id") REFERENCES "table" ("bar", "baz")`);
  });

  it('assert :: add foreign key (use delete cascade)', () => {
    const query = sql.table('table').alter();

    const constraint = query.constraint('foo').foreign('relation_id', 'table', ['bar', 'baz']);

    constraint.delete().cascade();

    const statement = query.build();

    equal(
      statement,
      `ALTER TABLE "table" ADD CONSTRAINT "foo" ` +
        `FOREIGN KEY ("relation_id") ` +
        `REFERENCES "table" ("bar", "baz") ` +
        `ON DELETE CASCADE`
    );
  });

  it('assert :: add foreign key (use delete nullable)', () => {
    const query = sql.table('table').alter();

    const constraint = query.constraint('foo').foreign('relation_id', 'table', ['bar', 'baz']);

    constraint.delete().null();

    const statement = query.build();

    equal(
      statement,
      `ALTER TABLE "table" ADD CONSTRAINT "foo" ` +
        `FOREIGN KEY ("relation_id") ` +
        `REFERENCES "table" ("bar", "baz") ` +
        `ON DELETE SET null`
    );
  });

  it('assert :: add foreign key (use delete restrict)', () => {
    const query = sql.table('table').alter();

    const constraint = query.constraint('foo').foreign('relation_id', 'table', ['bar', 'baz']);

    constraint.delete().restrict();

    const statement = query.build();

    equal(
      statement,
      `ALTER TABLE "table" ADD CONSTRAINT "foo" ` +
        `FOREIGN KEY ("relation_id") ` +
        `REFERENCES "table" ("bar", "baz") ` +
        `ON DELETE RESTRICT`
    );
  });

  it('assert :: add foreign key (use update cascade)', () => {
    const query = sql.table('table').alter();

    const constraint = query.constraint('foo').foreign('relation_id', 'table', ['bar', 'baz']);

    constraint.update().cascade();

    const statement = query.build();

    equal(
      statement,
      `ALTER TABLE "table" ADD CONSTRAINT "foo" ` +
        `FOREIGN KEY ("relation_id") ` +
        `REFERENCES "table" ("bar", "baz") ` +
        `ON UPDATE CASCADE`
    );
  });

  it('assert :: add foreign key (use update nullable)', () => {
    const query = sql.table('table').alter();

    const constraint = query.constraint('foo').foreign('relation_id', 'table', ['bar', 'baz']);

    constraint.update().null();

    const statement = query.build();

    equal(
      statement,
      `ALTER TABLE "table" ADD CONSTRAINT "foo" ` +
        `FOREIGN KEY ("relation_id") ` +
        `REFERENCES "table" ("bar", "baz") ` +
        `ON UPDATE SET null`
    );
  });

  it('assert :: add foreign key (use update restrict)', () => {
    const query = sql.table('table').alter();

    const constraint = query.constraint('foo').foreign('relation_id', 'table', ['bar', 'baz']);

    constraint.update().restrict();

    const statement = query.build();

    equal(
      statement,
      `ALTER TABLE "table" ADD CONSTRAINT "foo" ` +
        `FOREIGN KEY ("relation_id") ` +
        `REFERENCES "table" ("bar", "baz") ` +
        `ON UPDATE RESTRICT`
    );
  });
});
