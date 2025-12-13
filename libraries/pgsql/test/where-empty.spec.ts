import type { ObjectSchema } from '@ez4/schema';

import { beforeEach, describe, it } from 'node:test';

import { SqlBuilder } from '@ez4/pgsql';
import { SchemaType } from '@ez4/schema';

describe('sql where empty tests', () => {
  let sql: SqlBuilder;

  const testSchema: ObjectSchema = {
    type: SchemaType.Object,
    properties: {
      foo: {
        type: SchemaType.String
      },
      bar: {
        type: SchemaType.Array,
        element: {
          type: SchemaType.String
        }
      }
    }
  };

  beforeEach(() => {
    sql = new SqlBuilder();
  });

  it('assert :: where empty string (is in)', ({ assert }) => {
    const query = sql
      .select(testSchema)
      .from('test')
      .where({
        foo: {
          isIn: []
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, 'SELECT * FROM "test" WHERE false');
  });

  it('assert :: where empty string (contains)', ({ assert }) => {
    const query = sql
      .select(testSchema)
      .from('test')
      .where({
        foo: {
          contains: ''
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, ['']);

    assert.equal(statement, `SELECT * FROM "test" WHERE "foo" LIKE '%' || :0 || '%'`);
  });

  it('assert :: where empty array (is in)', ({ assert }) => {
    const query = sql
      .select(testSchema)
      .from('test')
      .where({
        bar: {
          isIn: []
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [[]]);

    assert.equal(statement, 'SELECT * FROM "test" WHERE "bar" <@ :0');
  });

  it('assert :: where empty array (contains)', ({ assert }) => {
    const query = sql
      .select(testSchema)
      .from('test')
      .where({
        bar: {
          contains: []
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [[]]);

    assert.equal(statement, 'SELECT * FROM "test" WHERE "bar" @> :0');
  });
});
