import type { Database, Query } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';

import { describe, it } from 'node:test';

import { MalformedRequestError, prepareUpdateQuery } from '@ez4/aws-aurora/client';
import { SchemaType } from '@ez4/schema';

import { makeParameter } from './common/parameters.js';

type TestRelations = {
  indexes: never;
  filters: {};
  selects: {};
  changes: {};
};

describe.only('aurora query (update schema)', () => {
  const prepareUpdate = <T extends Database.Schema, S extends Query.SelectInput<T, TestRelations>>(
    schema: ObjectSchema,
    data: Query.UpdateManyInput<T, S, TestRelations>['data']
  ) => {
    return prepareUpdateQuery<T, S, {}, TestRelations>('ez4-test-update-schema', schema, {}, { data });
  };

  it('assert :: prepare update schema (scalar boolean)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate(
      {
        type: SchemaType.Object,
        properties: {
          foo: {
            type: SchemaType.Boolean
          },
          bar: {
            type: SchemaType.Boolean
          }
        }
      },
      {
        foo: true,
        bar: false
      }
    );

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-schema" SET "foo" = :0, "bar" = :1`);

    assert.deepEqual(variables, [makeParameter('0', true), makeParameter('1', false)]);
  });

  it('assert :: prepare update schema (scalar number)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate(
      {
        type: SchemaType.Object,
        properties: {
          number: {
            type: SchemaType.Number
          }
        }
      },
      {
        number: 123
      }
    );

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-schema" SET "number" = :0`);

    assert.deepEqual(variables, [makeParameter('0', 123)]);
  });

  it('assert :: prepare update schema (scalar string)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate(
      {
        type: SchemaType.Object,
        properties: {
          text: {
            type: SchemaType.String
          }
        }
      },
      {
        text: 'foo'
      }
    );

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-schema" SET "text" = :0`);

    assert.deepEqual(variables, [makeParameter('0', 'foo')]);
  });

  it('assert :: prepare update schema (scalar nullable)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate(
      {
        type: SchemaType.Object,
        properties: {
          nullable: {
            type: SchemaType.String,
            nullable: true
          }
        }
      },
      {
        nullable: null
      }
    );

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-schema" SET "nullable" = :0`);

    assert.deepEqual(variables, [makeParameter('0', null)]);
  });

  it('assert :: prepare update schema (scalar optional)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate(
      {
        type: SchemaType.Object,
        properties: {
          optional: {
            type: SchemaType.String,
            optional: true
          }
        }
      },
      {
        optional: undefined
      }
    );

    assert.equal(statement, `SELECT * FROM "ez4-test-update-schema"`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare update schema (scalar optional and required)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate(
      {
        type: SchemaType.Object,
        properties: {
          required: {
            type: SchemaType.Number
          },
          optional: {
            type: SchemaType.String,
            optional: true
          }
        }
      },
      {
        required: undefined,
        optional: undefined
      }
    );

    assert.equal(statement, `SELECT * FROM "ez4-test-update-schema"`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare update schema (scalar invalid type)', async ({ assert }) => {
    await assert.rejects(
      () =>
        prepareUpdate(
          {
            type: SchemaType.Object,
            properties: {
              column: {
                type: SchemaType.Number
              }
            }
          },
          {
            // The `column` can't be string as per schema definition.
            column: 'foo'
          }
        ),
      MalformedRequestError
    );
  });

  it('assert :: prepare update schema (json boolean)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate(
      {
        type: SchemaType.Object,
        properties: {
          json: {
            type: SchemaType.Object,
            properties: {
              foo: {
                type: SchemaType.Boolean
              },
              bar: {
                type: SchemaType.Boolean
              }
            }
          }
        }
      },
      {
        json: {
          foo: true,
          bar: false
        }
      }
    );

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-schema" SET "json"['foo'] = :0, "json"['bar'] = :1`);

    assert.deepEqual(variables, [makeParameter('0', JSON.stringify(true), 'JSON'), makeParameter('1', JSON.stringify(false), 'JSON')]);
  });

  it('assert :: prepare update schema (json number)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate(
      {
        type: SchemaType.Object,
        properties: {
          json: {
            type: SchemaType.Object,
            properties: {
              number: {
                type: SchemaType.Number
              }
            }
          }
        }
      },
      {
        json: {
          number: 123
        }
      }
    );

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-schema" SET "json"['number'] = :0`);

    assert.deepEqual(variables, [makeParameter('0', JSON.stringify(123), 'JSON')]);
  });

  it('assert :: prepare update schema (json string)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate(
      {
        type: SchemaType.Object,
        properties: {
          json: {
            type: SchemaType.Object,
            properties: {
              text: {
                type: SchemaType.String
              }
            }
          }
        }
      },
      {
        json: {
          text: 'foo'
        }
      }
    );

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-schema" SET "json"['text'] = :0`);

    assert.deepEqual(variables, [makeParameter('0', JSON.stringify('foo'), 'JSON')]);
  });

  it('assert :: prepare update schema (json nullable)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate(
      {
        type: SchemaType.Object,
        properties: {
          json: {
            type: SchemaType.Object,
            properties: {
              nullable: {
                type: SchemaType.Number,
                nullable: true
              }
            }
          }
        }
      },
      {
        json: {
          nullable: null
        }
      }
    );

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-schema" SET "json"['nullable'] = :0`);

    assert.deepEqual(variables, [makeParameter('0', JSON.stringify(null), 'JSON')]);
  });

  it('assert :: prepare update schema (json optional)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate(
      {
        type: SchemaType.Object,
        properties: {
          json: {
            type: SchemaType.Object,
            properties: {
              optional: {
                type: SchemaType.Number,
                optional: true
              }
            }
          }
        }
      },
      {
        json: {
          optional: undefined
        }
      }
    );

    assert.equal(statement, `SELECT * FROM "ez4-test-update-schema"`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare update schema (json optional and required)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate(
      {
        type: SchemaType.Object,
        properties: {
          json: {
            type: SchemaType.Object,
            properties: {
              required: {
                type: SchemaType.String
              },
              optional: {
                type: SchemaType.Number,
                optional: true
              }
            }
          }
        }
      },
      {
        json: {
          required: undefined,
          optional: undefined
        }
      }
    );

    assert.equal(statement, `SELECT * FROM "ez4-test-update-schema"`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare update schema (json invalid type)', async ({ assert }) => {
    await assert.rejects(
      () =>
        prepareUpdate(
          {
            type: SchemaType.Object,
            properties: {
              json: {
                type: SchemaType.Object,
                properties: {
                  column: {
                    type: SchemaType.String
                  }
                }
              }
            }
          },
          {
            json: {
              // The `column` can't be numeric as per schema definition.
              column: 123
            }
          }
        ),
      MalformedRequestError
    );
  });
});
