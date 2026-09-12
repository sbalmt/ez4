import type { ObjectSchema } from '@ez4/schema';

import { beforeEach, describe, it } from 'node:test';

import { SchemaType } from '@ez4/schema';
import { SqlBuilder } from '@ez4/pgsql';

describe('sql where json missing tests', () => {
  let sql: SqlBuilder;

  const schema: ObjectSchema = {
    type: SchemaType.Object,
    properties: {
      json: {
        type: SchemaType.Object,
        properties: {
          foo: {
            type: SchemaType.String,
            nullable: true,
            optional: true
          }
        }
      }
    }
  };

  beforeEach(() => {
    sql = new SqlBuilder();
  });

  it('assert :: where json is missing', ({ assert }) => {
    const query = sql
      .select(schema)
      .from('test')
      .where({
        json: {
          foo: {
            isMissing: true
          }
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, `SELECT FROM "test" WHERE NOT ("json" ? 'foo')`);
  });

  it('assert :: where json is present', ({ assert }) => {
    const query = sql
      .select(schema)
      .from('test')
      .where({
        json: {
          foo: {
            isMissing: false
          }
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, `SELECT FROM "test" WHERE "json" ? 'foo'`);
  });

  it('assert :: where json is missing or null', ({ assert }) => {
    const query = sql
      .select(schema)
      .from('test')
      .where({
        json: {
          foo: {
            isMissingOrNull: true
          }
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, `SELECT FROM "test" WHERE (NOT ("json" ? 'foo') OR "json"->>'foo' IS null)`);
  });
});
