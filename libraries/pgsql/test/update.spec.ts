import type { ObjectSchema } from '@ez4/schema';

import { beforeEach, describe, it } from 'node:test';
import { equal, deepEqual } from 'node:assert';

import { SqlBuilder } from '@ez4/pgsql';
import { SchemaType } from '@ez4/schema';
import { Order } from '@ez4/database';

describe('sql update tests', () => {
  let sql: SqlBuilder;

  beforeEach(() => {
    sql = new SqlBuilder();
  });

  it('assert :: update with record', async () => {
    const query = sql.update().only('table').record({
      foo: 123,
      bar: 'abc',
      baz: undefined
    });

    deepEqual(query.fields, ['foo', 'bar']);
    deepEqual(query.values, [123, 'abc']);

    const [statement, variables] = query.build();

    deepEqual(variables, [123, 'abc']);

    equal(statement, 'UPDATE ONLY "table" SET "foo" = :0, "bar" = :1');
  });

  it('assert :: update with json record', async () => {
    const query = sql
      .update()
      .only('table')
      .record({
        foo: {
          bar: {
            baz: true
          }
        }
      });

    deepEqual(query.fields, ['foo']);

    deepEqual(query.values, [
      {
        bar: {
          baz: true
        }
      }
    ]);

    const [statement, variables] = query.build();

    deepEqual(variables, [true]);

    equal(statement, `UPDATE ONLY "table" SET "foo"['bar']['baz'] = :0`);
  });

  it('assert :: update with json record (nullable in schema)', async () => {
    const schema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        foo: {
          type: SchemaType.Object,
          nullable: true,
          properties: {
            bar: {
              type: SchemaType.String
            }
          }
        }
      }
    };

    const query = sql.update(schema).only('table').record({
      foo: null
    });

    const [statement, variables] = query.build();

    deepEqual(variables, []);

    equal(statement, `UPDATE ONLY "table" SET "foo" = null`);
  });

  it('assert :: update with json record (optional in schema)', async () => {
    const schema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        foo: {
          type: SchemaType.Object,
          optional: true,
          properties: {
            bar: {
              type: SchemaType.String
            },
            baz: {
              type: SchemaType.Object,
              properties: {
                baz_foo: {
                  type: SchemaType.Number
                }
              }
            },
            qux: {
              type: SchemaType.Object,
              nullable: true,
              properties: {
                qux_foo: {
                  type: SchemaType.Boolean
                }
              }
            }
          }
        }
      }
    };

    const query = sql
      .update(schema)
      .only('table')
      .record({
        foo: {
          bar: 'bar',
          baz: {
            baz_foo: 123
          },
          qux: {
            qux_foo: false
          }
        }
      });

    const [statement, variables] = query.build();

    deepEqual(variables, ['bar', 123, false]);

    equal(
      statement,
      `UPDATE ONLY "table" ` +
        `SET "foo" = COALESCE("foo", '{}'::jsonb) || jsonb_build_object(` +
        `'bar', :0, ` +
        `'baz', jsonb_build_object('baz_foo', :1), ` +
        `'qux', COALESCE("foo"['qux'], '{}'::jsonb) || jsonb_build_object('qux_foo', :2)` +
        `)`
    );
  });

  it('assert :: update with inner select record', async () => {
    const inner = sql.select().columns('baz').from('table2').where({
      qux: true
    });

    const query = sql.update().only('table1').record({
      foo: 'abc',
      bar: inner
    });

    deepEqual(query.fields, ['foo', 'bar']);
    deepEqual(query.values, ['abc', inner]);

    const [statement, variables] = query.build();

    deepEqual(variables, ['abc', true]);

    equal(statement, 'UPDATE ONLY "table1" SET "foo" = :0, "bar" = (SELECT "baz" FROM "table2" WHERE "qux" = :1)');
  });

  it('assert :: update with raw record value', async () => {
    const value = {
      baz: {
        qux: 'abc'
      }
    };

    const query = sql
      .update()
      .only('table')
      .record({
        foo: 123,
        bar: sql.rawValue(value)
      });

    const [statement, variables] = query.build();

    deepEqual(variables, [123, value]);

    equal(statement, 'UPDATE ONLY "table" SET "foo" = :0, "bar" = :1');
  });

  it('assert :: update with raw record operation', async () => {
    const query = sql
      .update()
      .only('table')
      .record({
        foo: 123,
        bar: sql.rawOperation('+', 456)
      });

    const [statement, variables] = query.build();

    deepEqual(variables, [123, 456]);

    equal(statement, 'UPDATE ONLY "table" SET "foo" = :0, "bar" = ("bar" + :1)');
  });

  it('assert :: update with raw json record operation', async () => {
    const schema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        foo: {
          type: SchemaType.Object,
          properties: {
            bar: {
              type: SchemaType.Number,
              format: 'integer'
            }
          }
        }
      }
    };

    const query = sql
      .update(schema)
      .only('table')
      .record({
        foo: {
          bar: sql.rawOperation('-', 123)
        }
      });

    const [statement, variables] = query.build();

    deepEqual(variables, [123]);

    equal(statement, `UPDATE ONLY "table" SET "foo"['bar'] = (("foo"->>'bar')::int - (:0)::int)::text::jsonb`);
  });

  it('assert :: update with raw json record operation (optional in schema)', async () => {
    const schema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        foo: {
          type: SchemaType.Object,
          optional: true,
          properties: {
            bar: {
              type: SchemaType.Number,
              format: 'decimal',
              definitions: {
                default: 999
              }
            }
          }
        }
      }
    };

    const query = sql
      .update(schema)
      .only('table')
      .record({
        foo: {
          bar: sql.rawOperation('*', 123)
        }
      });

    const [statement, variables] = query.build();

    deepEqual(variables, [123]);

    equal(
      statement,
      `UPDATE ONLY "table" ` +
        `SET "foo" = COALESCE("foo", '{}'::jsonb) || jsonb_build_object('bar', ((COALESCE("foo"->>'bar', '999'))::dec * (:0)::dec)::text::jsonb)`
    );
  });

  it('assert :: update with raw json record operation (union schema)', async () => {
    const schema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        foo: {
          type: SchemaType.Union,
          elements: [
            {
              type: SchemaType.Object,
              properties: {
                bar: {
                  type: SchemaType.Number,
                  format: 'decimal'
                }
              }
            },
            {
              type: SchemaType.Object,
              properties: {
                baz: {
                  type: SchemaType.Number,
                  format: 'integer'
                }
              }
            }
          ]
        }
      }
    };

    const [statement1, variables1] = sql
      .update(schema)
      .only('table')
      .record({
        foo: {
          baz: sql.rawOperation('/', 123)
        }
      })
      .build();

    const [statement2, variables2] = sql
      .reset()
      .update(schema)
      .only('table')
      .record({
        foo: {
          bar: sql.rawOperation('/', 456)
        }
      })
      .build();

    deepEqual(variables1, [123]);
    deepEqual(variables2, [456]);

    equal(statement1, `UPDATE ONLY "table" SET "foo"['baz'] = (("foo"->>'baz')::int / (:0)::int)::text::jsonb`);
    equal(statement2, `UPDATE ONLY "table" SET "foo"['bar'] = (("foo"->>'bar')::dec / (:0)::dec)::text::jsonb`);
  });

  it('assert :: update with alias', async () => {
    const query = sql.update().only('table').as('alias').record({
      foo: true
    });

    const [statement, variables] = query.build();

    deepEqual(variables, [true]);

    equal(statement, 'UPDATE ONLY "table" AS "alias" SET "foo" = :0');
  });

  it('assert :: update with returning', async () => {
    const query = sql.update().only('table').as('alias').returning(['foo', 'bar']).record({
      foo: true
    });

    const [statement, variables] = query.build();

    deepEqual(variables, [true]);

    equal(statement, 'UPDATE ONLY "table" AS "alias" SET "foo" = :0 RETURNING "alias"."foo", "alias"."bar"');
  });

  it('assert :: update with where', async () => {
    const query = sql
      .update()
      .only('table')
      .record({
        foo: true
      })
      .where({
        bar: 'abc'
      });

    const [statement, variables] = query.build();

    deepEqual(variables, [true, 'abc']);

    equal(statement, 'UPDATE ONLY "table" SET "foo" = :0 WHERE "bar" = :1');
  });

  it('assert :: update with inner query', async () => {
    const inner = sql.select().columns('foo').from('inner').as('inner').where({ bar: 'abc' }).take(1).order({
      baz: Order.Desc
    });

    const query = sql
      .update()
      .only('table')
      .as('outer')
      .from(inner)
      .record({
        qux: inner.reference('foo'),
        xyz: true
      });

    const [statement, variables] = query.build();

    deepEqual(variables, [true, 'abc']);

    equal(
      statement,
      `UPDATE ONLY "table" AS "outer" ` +
        `SET "qux" = "inner"."foo", "xyz" = :0 FROM ` +
        `(SELECT "S0"."foo" FROM "inner" AS "S0" WHERE "S0"."bar" = :1 ORDER BY "S0"."baz" DESC LIMIT 1) AS "inner"`
    );
  });
});
