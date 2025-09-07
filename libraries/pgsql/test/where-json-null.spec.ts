import type { AnySchema, ObjectSchema } from '@ez4/schema';

import { beforeEach, describe, it } from 'node:test';

import { SchemaType } from '@ez4/schema';
import { SqlBuilder } from '@ez4/pgsql';

describe('sql where json null tests', () => {
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

  it('assert :: where json is null (implicit)', ({ assert }) => {
    const query = sql
      .select(schema)
      .from('test')
      .where({
        json: {
          foo: null
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, `SELECT * FROM "test" WHERE "json"->>'foo' IS null`);
  });

  it('assert :: where json is null (explicit)', ({ assert }) => {
    const query = sql
      .select(schema)
      .from('test')
      .where({
        json: {
          foo: {
            equal: null
          }
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, `SELECT * FROM "test" WHERE "json"->>'foo' IS null`);
  });

  it('assert :: where json is null (operator)', ({ assert }) => {
    const query = sql
      .select(schema)
      .from('test')
      .where({
        json: {
          foo: {
            isNull: true
          }
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, `SELECT * FROM "test" WHERE "json"->>'foo' IS null`);
  });

  it('assert :: where json is not null (explicit)', ({ assert }) => {
    const query = sql
      .select(schema)
      .from('test')
      .where({
        json: {
          foo: {
            not: null
          }
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, `SELECT * FROM "test" WHERE "json"->>'foo' IS NOT null`);
  });

  it('assert :: where json is not null (operator)', ({ assert }) => {
    const query = sql
      .select(schema)
      .from('test')
      .where({
        json: {
          foo: {
            isNull: false
          }
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, `SELECT * FROM "test" WHERE "json"->>'foo' IS NOT null`);
  });
});
