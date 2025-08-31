import type { AnySchema, ObjectSchema } from '@ez4/schema';

import { beforeEach, describe, it } from 'node:test';

import { SchemaType } from '@ez4/schema';
import { SqlBuilder } from '@ez4/pgsql';

describe('sql where json tests', () => {
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

    assert.equal(statement, `SELECT * FROM "test" WHERE ("foo"['bar']::int >= :0 AND "foo"['bar']::int < :1)`);
  });

  it('assert :: where nested fields (without json object schema)', ({ assert }) => {
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

  it('assert :: where nested fields (with json object)', ({ assert }) => {
    const schema = getJsonObject({
      type: SchemaType.Object,
      properties: {
        baz: {
          type: SchemaType.Boolean
        }
      }
    });

    const query = sql
      .select(schema)
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

    assert.equal(statement, `SELECT * FROM "test" AS "alias" WHERE "alias"."foo"['bar']['baz']::bool = :0`);
  });

  it('assert :: where nested fields (with json object union)', ({ assert }) => {
    const schema = getJsonObject({
      type: SchemaType.Union,
      elements: [
        {
          type: SchemaType.Object,
          properties: {
            baz: {
              type: SchemaType.Boolean
            }
          }
        },
        {
          type: SchemaType.Object,
          properties: {
            qux: {
              type: SchemaType.Number
            }
          }
        }
      ]
    });

    const query1 = sql
      .select(schema)
      .from('test')
      .as('alias')
      .where({
        foo: {
          bar: {
            baz: true
          }
        }
      });

    const [statement1, variables1] = query1.build();

    assert.deepEqual(variables1, [true]);

    assert.equal(statement1, `SELECT * FROM "test" AS "alias" WHERE "alias"."foo"['bar']['baz']::bool = :0`);

    sql.reset();

    const query2 = sql
      .select(schema)
      .from('test')
      .as('alias')
      .where({
        foo: {
          bar: {
            qux: 123
          }
        }
      });

    const [statement2, variables2] = query2.build();

    assert.deepEqual(variables2, [123]);

    assert.equal(statement2, `SELECT * FROM "test" AS "alias" WHERE "alias"."foo"['bar']['qux']::int = :0`);
  });

  it('assert :: where multiple fields (with json object)', ({ assert }) => {
    const schema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        foo: {
          type: SchemaType.Object,
          properties: {
            bar: {
              type: SchemaType.Number
            },
            baz: {
              type: SchemaType.Boolean
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
          baz: false
        }
      });

    const [statement, variables] = query.build();

    assert.deepEqual(variables, [123, false]);

    assert.equal(statement, `SELECT * FROM "test" AS "alias" WHERE ("alias"."foo"['bar']::int = :0 AND "alias"."foo"['baz']::bool = :1)`);
  });

  it('assert :: where multiple fields (with dynamic json object)', ({ assert }) => {
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

    assert.equal(statement, `SELECT * FROM "test" AS "alias" WHERE ("alias"."foo"['bar']::int = :0 AND "alias"."foo"['baz']::int = :1)`);
  });
});
