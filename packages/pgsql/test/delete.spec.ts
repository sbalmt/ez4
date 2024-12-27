import { beforeEach, describe, it } from 'node:test';
import { deepEqual, equal } from 'node:assert';

import { SqlBuilder } from '@ez4/pgsql';

describe.only('sql delete tests', () => {
  let sql: SqlBuilder;

  beforeEach(() => {
    sql = new SqlBuilder();
  });

  it('assert :: delete all', async () => {
    const query = sql.delete('table');

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(statement, 'DELETE FROM "table"');
  });

  it('assert :: delete with alias', async () => {
    const query = sql.delete().from('table').as('alias');

    const [statement, values] = query.build();

    deepEqual(values, []);

    equal(statement, 'DELETE FROM "table" AS "alias"');
  });

  it('assert :: delete with returning', async () => {
    const query = sql.delete().from('table').as('alias').returning('foo', 'bar');

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(statement, 'DELETE FROM "table" AS "alias" RETURNING "alias"."foo", "alias"."bar"');
  });

  it('assert :: delete with where', async () => {
    const query = sql.delete().from('table').as('alias').where({ id: 'abc' });

    const [statement, variables] = query.build();

    deepEqual(variables, ['abc']);

    equal(statement, 'DELETE FROM "table" AS "alias" WHERE "alias"."id" = :0');
  });
});
