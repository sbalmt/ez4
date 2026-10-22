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
        nullable: true,
        optional: true,
        properties: {
          nested: {
            type: SchemaType.Object,
            optional: true,
            properties: {
              value: {
                type: SchemaType.String
              }
            }
          },
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

  it('assert :: where json column is missing', ({ assert }) => {
    const query = sql
      .select(schema)
      .from('test')
      .where({
        json: {
          isMissing: true
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);
    assert.equal(statement, `SELECT FROM "test" WHERE "json" IS null`);
  });

  it('assert :: where nested json object is missing', ({ assert }) => {
    const query = sql
      .select(schema)
      .from('test')
      .where({
        json: {
          nested: {
            isMissing: true
          }
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);
    assert.equal(statement, `SELECT FROM "test" WHERE NOT ("json" ? 'nested')`);
  });

  it('assert :: where json column is present', ({ assert }) => {
    const query = sql
      .select(schema)
      .from('test')
      .where({
        json: {
          isMissing: false
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);
    assert.equal(statement, `SELECT FROM "test" WHERE "json" IS NOT null`);
  });

  it('assert :: where nested json object is present', ({ assert }) => {
    const query = sql
      .select(schema)
      .from('test')
      .where({
        json: {
          nested: {
            isMissing: false
          }
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);
    assert.equal(statement, `SELECT FROM "test" WHERE "json" ? 'nested'`);
  });

  it('assert :: where json column is missing or null', ({ assert }) => {
    const query = sql
      .select(schema)
      .from('test')
      .where({
        json: {
          isMissingOrNull: true
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);
    assert.equal(statement, `SELECT FROM "test" WHERE "json" IS null`);
  });

  it('assert :: where json column is present and not null', ({ assert }) => {
    const query = sql
      .select(schema)
      .from('test')
      .where({
        json: {
          isMissingOrNull: false
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);
    assert.equal(statement, `SELECT FROM "test" WHERE "json" IS NOT null`);
  });

  it('assert :: where json field is missing', ({ assert }) => {
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

  it('assert :: where json field is present', ({ assert }) => {
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

  it('assert :: where json field is missing or null', ({ assert }) => {
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
