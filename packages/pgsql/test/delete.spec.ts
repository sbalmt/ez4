import { describe, it } from 'node:test';
import { equal } from 'node:assert';

import { Sql } from '@ez4/pgsql';

describe.only('sql delete tests', () => {
  it('assert :: delete', async () => {
    const query = Sql.delete('table');

    equal(query.toString(), 'DELETE FROM "table"');
  });

  it('assert :: delete with returning', async () => {
    const query = Sql.delete().from('table').returning('foo', 'bar');

    equal(query.toString(), 'DELETE FROM "table" RETURNING "foo", "bar"');
  });

  it('assert :: delete with alias', async () => {
    const query = Sql.delete().from('table').as('alias');

    equal(query.toString(), 'DELETE FROM "table" AS "alias"');
  });

  it('assert :: delete with where', async () => {
    const query = Sql.delete().from('table');

    query.where({
      id: 'abc'
    });

    equal(query.toString(), 'DELETE FROM "table" WHERE "id" = :0');
  });
});
