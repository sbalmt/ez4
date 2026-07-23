import { beforeEach, describe, it } from 'node:test';
import { deepEqual, equal, ok } from 'node:assert';

import { SqlBuilder } from '@ez4/pgsql';

describe('sql result names tests', () => {
  let sql: SqlBuilder;

  beforeEach(() => {
    sql = new SqlBuilder();
  });

  it('assert :: names with plain columns', async () => {
    const query = sql.select().columns('foo', 'bar').from('table');

    deepEqual(query.results.names(), ['foo', 'bar']);
  });

  it('assert :: names with column alias', async () => {
    const query = sql.select().columns('foo', ['bar', 'alias_bar']).from('table');

    deepEqual(query.results.names(), ['foo', 'alias_bar']);
  });

  it('assert :: names with record', async () => {
    const query = sql.select().from('table').record({
      id: true,
      name: true
    });

    deepEqual(query.results.names(), ['id', 'name']);
  });

  it('assert :: names with json record column', async () => {
    const query = sql
      .select()
      .from('table')
      .record({
        id: true,
        payload: {
          foo: true
        }
      });

    deepEqual(query.results.names(), ['id', 'payload']);
  });

  it('assert :: names with json object column', async () => {
    const query = sql.select().from('table');

    query.objectColumn({ id: true }, { column: 'relation' });

    deepEqual(query.results.names(), ['relation']);
  });

  it('assert :: names with aliased raw column', async () => {
    const query = sql.select().from('table');

    query.rawColumn('COUNT(1) AS "total"', 'total');

    deepEqual(query.results.names(), ['total']);
  });

  it('assert :: no names with raw column (missing alias)', async () => {
    const query = sql.select().from('table');

    query.rawColumn('COUNT(1)');

    equal(query.results.names(), undefined);
  });

  it('assert :: no names with column reference', async () => {
    const query = sql.select().from('table').as('alias');

    query.column(query.reference('field'));

    equal(query.results.names(), undefined);
  });

  it('assert :: no names with known and unknown columns', async () => {
    const query = sql.select().from('table');

    query.column('id');
    query.rawColumn('COUNT(1)');

    equal(query.results.names(), undefined);
  });

  it('assert :: empty names without returning columns', async () => {
    const query = sql.insert().into('table').record({ foo: 123 }).returning();

    deepEqual(query.results?.names(), []);
  });

  it('assert :: names with returning record', async () => {
    const query = sql.delete().from('table').returning(['foo', 'bar']);

    deepEqual(query.results?.names(), ['foo', 'bar']);
  });

  it('assert :: names match statement aliases (filtered sub-select column)', async () => {
    const outer = sql.select().from('table').as('R');

    const relation = sql
      .select()
      .from('relation_table')
      .where({ id: outer.reference('relation_id') })
      .take(1);

    relation.objectColumn({ name: true }, {});

    outer.record({
      id: true,
      relation
    });

    // Names must be captured before build: building replaces the sub-select
    // alias with a temporary one while emitting `AS "relation"` in the SQL.
    deepEqual(outer.results.names(), ['id', 'relation']);

    const [statement] = outer.build();

    ok(statement.includes('AS "relation"'));
  });
});
