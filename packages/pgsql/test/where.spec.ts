import type { AnySchema, ObjectSchema } from '@ez4/schema';

import { beforeEach, describe, it } from 'node:test';

import { SchemaType } from '@ez4/schema';
import { SqlBuilder } from '@ez4/pgsql';

describe('sql where tests', () => {
  let sql: SqlBuilder;

  const getJsonObject = (field: AnySchema): ObjectSchema => {
    return {
      type: SchemaType.Object,
      properties: {
        foo: {
          type: SchemaType.Object,
          properties: {
            bar: field
          }
        }
      }
    };
  };

  beforeEach(() => {
    sql = new SqlBuilder();
  });

  it('assert :: where no filters', ({ assert }) => {
    const query = sql.select().from('test').where();

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, `SELECT * FROM "test"`);
  });

  it('assert :: where equal (implicit)', ({ assert }) => {
    const query = sql.select().from('test').where({
      foo: 'abc'
    });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, ['abc']);

    assert.equal(statement, 'SELECT * FROM "test" WHERE "foo" = :0');
  });

  it('assert :: where equal (implicit with json value)', ({ assert }) => {
    const schema = getJsonObject({
      type: SchemaType.String
    });

    const query = sql
      .select(schema)
      .from('test')
      .where({
        foo: {
          bar: 'abc'
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, ['abc']);

    assert.equal(statement, `SELECT * FROM "test" WHERE trim('"' from "foo"['bar']::text) = :0`);
  });

  it('assert :: where equal (explicit)', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          equal: 'abc'
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, ['abc']);

    assert.equal(statement, 'SELECT * FROM "test" WHERE "foo" = :0');
  });

  it('assert :: where equal (explicit with json value)', ({ assert }) => {
    const schema = getJsonObject({
      type: SchemaType.Boolean
    });

    const query = sql
      .select(schema)
      .from('test')
      .where({
        foo: {
          bar: {
            equal: true
          }
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [true]);

    assert.equal(statement, `SELECT * FROM "test" WHERE "foo"['bar']::bool = :0`);
  });

  it('assert :: where not equal', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          not: 123
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [123]);

    assert.equal(statement, 'SELECT * FROM "test" WHERE "foo" != :0');
  });

  it('assert :: where not equal (with json value)', ({ assert }) => {
    const schema = getJsonObject({
      type: SchemaType.String
    });

    const query = sql
      .select(schema)
      .from('test')
      .where({
        foo: {
          bar: {
            not: 'abc'
          }
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, ['abc']);

    assert.equal(statement, `SELECT * FROM "test" WHERE trim('"' from "foo"['bar']::text) != :0`);
  });

  it('assert :: where greater than', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          gt: 0
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [0]);

    assert.equal(statement, 'SELECT * FROM "test" WHERE "foo" > :0');
  });

  it('assert :: where greater than (with json value)', ({ assert }) => {
    const schema = getJsonObject({
      type: SchemaType.Number
    });

    const query = sql
      .select(schema)
      .from('test')
      .where({
        foo: {
          bar: {
            gt: 5
          }
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [5]);

    assert.equal(statement, `SELECT * FROM "test" WHERE "foo"['bar']::int > :0`);
  });

  it('assert :: where greater than or equal', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          gte: 0
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [0]);

    assert.equal(statement, 'SELECT * FROM "test" WHERE "foo" >= :0');
  });

  it('assert :: where greater than or equal (with json value)', ({ assert }) => {
    const schema = getJsonObject({
      type: SchemaType.Number
    });

    const query = sql
      .select(schema)
      .from('test')
      .where({
        foo: {
          bar: {
            gte: 5
          }
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [5]);

    assert.equal(statement, `SELECT * FROM "test" WHERE "foo"['bar']::int >= :0`);
  });

  it('assert :: where less than', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          lt: 0
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [0]);

    assert.equal(statement, 'SELECT * FROM "test" WHERE "foo" < :0');
  });

  it('assert :: where less than (with json value)', ({ assert }) => {
    const schema = getJsonObject({
      type: SchemaType.Number
    });

    const query = sql
      .select(schema)
      .from('test')
      .where({
        foo: {
          bar: {
            lt: 5
          }
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [5]);

    assert.equal(statement, `SELECT * FROM "test" WHERE "foo"['bar']::int < :0`);
  });

  it('assert :: where less than or equal', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          lte: 0
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [0]);

    assert.equal(statement, 'SELECT * FROM "test" WHERE "foo" <= :0');
  });

  it('assert :: where less than or equal (with json value)', ({ assert }) => {
    const schema = getJsonObject({
      type: SchemaType.Number
    });

    const query = sql
      .select(schema)
      .from('test')
      .where({
        foo: {
          bar: {
            lte: 5
          }
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [5]);

    assert.equal(statement, `SELECT * FROM "test" WHERE "foo"['bar']::int <= :0`);
  });

  it('assert :: where is in', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          isIn: [1, 2, 3]
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [1, 2, 3]);

    assert.equal(statement, 'SELECT * FROM "test" WHERE "foo" IN (:0, :1, :2)');
  });

  it('assert :: where is in (with json value)', ({ assert }) => {
    const schema = getJsonObject({
      type: SchemaType.Number,
      format: 'decimal'
    });

    const query = sql
      .select(schema)
      .from('test')
      .where({
        foo: {
          bar: {
            isIn: [1.5, 2.1, 3.8]
          }
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [1.5, 2.1, 3.8]);

    assert.equal(statement, `SELECT * FROM "test" WHERE "foo"['bar']::dec IN (:0, :1, :2)`);
  });

  it('assert :: where is in (with json array)', ({ assert }) => {
    const schema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        foo: {
          type: SchemaType.Array,
          element: {
            type: SchemaType.Number
          }
        },
        bar: {
          type: SchemaType.Object,
          properties: {},
          additional: {
            property: {
              type: SchemaType.String
            },
            value: {
              type: SchemaType.Number
            }
          }
        }
      }
    };

    const query = sql
      .select(schema)
      .from('test')
      .where({
        foo: {
          isIn: ['abc']
        },
        bar: {
          isIn: {
            abc: 123
          }
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [['abc'], { abc: 123 }]);

    assert.equal(statement, `SELECT * FROM "test" WHERE "foo" <@ :0 AND "bar" <@ :1`);
  });

  it('assert :: where is between', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          isBetween: [1, 2]
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [1, 2]);

    assert.equal(statement, 'SELECT * FROM "test" WHERE "foo" BETWEEN :0 AND :1');
  });

  it('assert :: where is between (with json value)', ({ assert }) => {
    const schema = getJsonObject({
      type: SchemaType.Number
    });

    const query = sql
      .select(schema)
      .from('test')
      .where({
        foo: {
          bar: {
            isBetween: [1, 2]
          }
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [1, 2]);

    assert.equal(statement, `SELECT * FROM "test" WHERE "foo"['bar']::int BETWEEN :0 AND :1`);
  });

  it('assert :: where is missing', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          isMissing: true
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, 'SELECT * FROM "test" WHERE "foo" IS null');
  });

  it('assert :: where is not missing', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          isMissing: false
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, 'SELECT * FROM "test" WHERE "foo" IS NOT null');
  });

  it('assert :: where is null (implicit)', ({ assert }) => {
    const query = sql.select().from('test').where({ foo: null });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, 'SELECT * FROM "test" WHERE "foo" IS null');
  });

  it('assert :: where is null (explicit)', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          isNull: true
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, 'SELECT * FROM "test" WHERE "foo" IS null');
  });

  it('assert :: where is not null', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          isNull: false
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, 'SELECT * FROM "test" WHERE "foo" IS NOT null');
  });

  it('assert :: where starts with', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          startsWith: 'abc'
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, ['abc']);

    assert.equal(statement, `SELECT * FROM "test" WHERE "foo" LIKE :0 || '%'`);
  });

  it('assert :: where starts with (with insensitive)', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          startsWith: 'abc',
          insensitive: true
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, ['abc']);

    assert.equal(statement, `SELECT * FROM "test" WHERE "foo" ILIKE :0 || '%'`);
  });

  it('assert :: where starts with (with json value)', ({ assert }) => {
    const schema = getJsonObject({
      type: SchemaType.String
    });

    const query = sql
      .select(schema)
      .from('test')
      .where({
        foo: {
          bar: {
            startsWith: 'abc'
          }
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, ['abc']);

    assert.equal(statement, `SELECT * FROM "test" WHERE trim('"' from "foo"['bar']::text) LIKE :0 || '%'`);
  });

  it('assert :: where contains', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          contains: 'abc'
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, ['abc']);

    assert.equal(statement, `SELECT * FROM "test" WHERE "foo" LIKE '%' || :0 || '%'`);
  });

  it('assert :: where contains (with insensitive)', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          contains: 'abc',
          insensitive: true
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, ['abc']);

    assert.equal(statement, `SELECT * FROM "test" WHERE "foo" ILIKE '%' || :0 || '%'`);
  });

  it('assert :: where contains (with json value)', ({ assert }) => {
    const schema = getJsonObject({
      type: SchemaType.String
    });

    const query = sql
      .select(schema)
      .from('test')
      .where({
        foo: {
          bar: {
            contains: 'abc'
          }
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, ['abc']);

    assert.equal(statement, `SELECT * FROM "test" WHERE trim('"' from "foo"['bar']::text) LIKE '%' || :0 || '%'`);
  });

  it('assert :: where contains (with json object)', ({ assert }) => {
    const schema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        foo: {
          type: SchemaType.Array,
          element: {
            type: SchemaType.Number
          }
        },
        bar: {
          type: SchemaType.Object,
          properties: {},
          additional: {
            property: {
              type: SchemaType.String
            },
            value: {
              type: SchemaType.Number
            }
          }
        }
      }
    };

    const query = sql
      .select(schema)
      .from('test')
      .where({
        foo: {
          contains: ['abc']
        },
        bar: {
          contains: {
            abc: 123
          }
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [['abc'], { abc: 123 }]);

    assert.equal(statement, `SELECT * FROM "test" WHERE "foo" @> :0 AND "bar" @> :1`);
  });

  it('assert :: where multiple operators', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          gte: 123,
          lt: 456
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [123, 456]);

    assert.equal(statement, 'SELECT * FROM "test" WHERE ("foo" >= :0 AND "foo" < :1)');
  });

  it('assert :: where multiple operators (with json object)', ({ assert }) => {
    const schema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        foo: {
          type: SchemaType.Object,
          properties: {},
          additional: {
            property: {
              type: SchemaType.String
            },
            value: {
              type: SchemaType.Number
            }
          }
        }
      }
    };

    const query = sql
      .select(schema)
      .from('test')
      .where({
        foo: {
          bar: {
            gte: 123,
            lt: 456
          }
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [123, 456]);

    assert.equal(statement, `SELECT * FROM "test" WHERE ("foo"['bar'] >= :0 AND "foo"['bar'] < :1)`);
  });

  it('assert :: where not', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        NOT: {
          foo: 123,
          bar: 'abc'
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [123, 'abc']);

    assert.equal(statement, 'SELECT * FROM "test" WHERE NOT ("foo" = :0 AND "bar" = :1)');
  });

  it('assert :: where and', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        AND: [
          {
            foo: 123,
            bar: 'abc'
          },
          {
            OR: [
              {
                baz: 456
              },
              {
                qux: 789
              }
            ]
          }
        ]
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [123, 'abc', 456, 789]);

    assert.equal(statement, 'SELECT * FROM "test" WHERE ("foo" = :0 AND "bar" = :1 AND ("baz" = :2 OR "qux" = :3))');
  });

  it('assert :: where or', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        OR: [
          {
            foo: 123,
            bar: 'abc'
          },
          {
            AND: [
              {
                baz: 456
              },
              {
                qux: 789
              }
            ]
          }
        ]
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [123, 'abc', 456, 789]);

    assert.equal(statement, 'SELECT * FROM "test" WHERE (("foo" = :0 AND "bar" = :1) OR ("baz" = :2 AND "qux" = :3))');
  });

  it('assert :: where with alias', ({ assert }) => {
    const query = sql.select().from('test').as('alias').where({
      foo: true
    });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [true]);

    assert.equal(statement, `SELECT * FROM "test" AS "alias" WHERE "alias"."foo" = :0`);
  });

  it('assert :: where with nested fields', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .as('alias')
      .where({
        foo: {
          bar: {
            baz: true
          }
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [true]);

    assert.equal(statement, `SELECT * FROM "test" AS "alias" WHERE "alias"."foo"['bar']['baz'] = :0`);
  });

  it('assert :: where with multiple fields', ({ assert }) => {
    const schema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        foo: {
          type: SchemaType.Object,
          properties: {},
          additional: {
            property: {
              type: SchemaType.String
            },
            value: {
              type: SchemaType.Number
            }
          }
        }
      }
    };

    const query = sql
      .select(schema)
      .from('test')
      .as('alias')
      .where({
        foo: {
          bar: 123,
          baz: 456
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [123, 456]);

    assert.equal(statement, `SELECT * FROM "test" AS "alias" WHERE ("alias"."foo"['bar'] = :0 AND "alias"."foo"['baz'] = :1)`);
  });

  it('assert :: where with raw value', ({ assert }) => {
    const query = sql.select().from('test');

    query.where({
      foo: sql.rawValue(() => 'plain_foo'),
      bar: sql.rawValue('plain_bar')
    });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, `SELECT * FROM "test" WHERE "foo" = plain_foo AND "bar" = plain_bar`);
  });

  it('assert :: where with reference', ({ assert }) => {
    const query = sql.select().from('test');

    query.where({
      foo: {
        bar: {
          baz: query.reference('column')
        }
      }
    });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, `SELECT * FROM "test" WHERE "foo"['bar']['baz'] = "column"`);
  });

  it('assert :: where with exists', ({ assert }) => {
    const query = sql.select().from('test').as('alias_test');

    query.where({
      foo_condition: sql
        .select()
        .rawColumn(1)
        .from('inner')
        .where({
          foo: query.reference('bar')
        })
    });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(
      statement,
      `SELECT * FROM "test" AS "alias_test" ` + `WHERE EXISTS (SELECT 1 FROM "inner" WHERE "foo" = "alias_test"."bar")`
    );
  });

  it('assert :: where empty', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: {
          // Make where condition to be falsy.
          isIn: []
        },
        AND: [],
        OR: [],
        NOT: {}
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, `SELECT * FROM "test" WHERE false`);
  });

  it('assert :: where undefined', ({ assert }) => {
    const query = sql
      .select()
      .from('test')
      .where({
        foo: undefined,
        bar: {
          equal: undefined
        },
        baz: {
          qux: undefined
        },
        AND: [
          {
            foo: undefined
          },
          {}
        ],
        OR: [
          {
            bar: undefined
          },
          {}
        ],
        NOT: {
          baz: undefined
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, []);

    assert.equal(statement, `SELECT * FROM "test"`);
  });
});
