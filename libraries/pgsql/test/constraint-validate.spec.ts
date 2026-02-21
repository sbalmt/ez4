import { beforeEach, describe, it } from 'node:test';
import { equal } from 'node:assert/strict';

import { SqlBuilder } from '@ez4/pgsql';

describe('sql table validate constraint tests', () => {
  let sql: SqlBuilder;

  beforeEach(() => {
    sql = new SqlBuilder();
  });

  it('assert :: validate constraint', () => {
    const query = sql.table('table').alter().constraint('foo').validate();

    const statement = query.build();

    equal(statement, `ALTER TABLE "table" VALIDATE CONSTRAINT "foo"`);
  });
});
