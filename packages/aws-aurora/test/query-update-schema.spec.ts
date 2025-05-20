import type { Query, RelationMetadata } from '@ez4/database';
import type { PostgresEngine } from '@ez4/aws-aurora/client';
import type { ObjectSchema } from '@ez4/schema';

import { describe, it } from 'node:test';

import { MalformedRequestError, MissingFieldSchemaError, prepareUpdateQuery } from '@ez4/aws-aurora/client';
import { SchemaType } from '@ez4/schema';

import { makeParameter } from './common/parameters.js';

type TestTableMetadata = {
  engine: PostgresEngine;
  relations: RelationMetadata;
  indexes: {};
  schema: {};
};

describe('aurora query (update schema)', () => {
  const prepareUpdate = <S extends Query.SelectInput<TestTableMetadata>>(
    schema: ObjectSchema,
    query: Query.UpdateManyInput<S, TestTableMetadata>
  ) => {
    return prepareUpdateQuery<TestTableMetadata, S>('ez4-test-update-schema', schema, {}, query);
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
        data: {
          foo: true,
          bar: false
        }
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
        data: {
          number: 123
        }
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
        data: {
          text: 'foo'
        }
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
        data: {
          nullable: null
        }
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
        data: {
          optional: undefined
        }
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
        data: {
          required: undefined,
          optional: undefined
        }
      }
    );

    assert.equal(statement, `SELECT * FROM "ez4-test-update-schema"`);

    assert.deepEqual(variables, []);
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
        data: {
          json: {
            foo: true,
            bar: false
          }
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
        data: {
          json: {
            number: 123
          }
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
        data: {
          json: {
            text: 'foo'
          }
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
        data: {
          json: {
            nullable: null
          }
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
            optional: true,
            properties: {
              optional: {
                type: SchemaType.Number
              }
            }
          }
        }
      },
      {
        data: {
          json: {
            optional: 123
          }
        }
      }
    );

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-schema" SET "json" = :0`);

    assert.deepEqual(variables, [makeParameter('0', { optional: 123 })]);
  });

  it('assert :: prepare update schema (json optional children)', async ({ assert }) => {
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
        data: {
          json: {
            optional: undefined
          }
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
        data: {
          json: {
            required: undefined,
            optional: undefined
          }
        }
      }
    );

    assert.equal(statement, `SELECT * FROM "ez4-test-update-schema"`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare update schema (with select)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate(
      {
        type: SchemaType.Object,
        properties: {
          scalar: {
            type: SchemaType.String,
            optional: true
          },
          json: {
            type: SchemaType.Object,
            properties: {
              scalar: {
                type: SchemaType.Number
              }
            }
          }
        }
      },
      {
        select: {
          scalar: true,
          json: {
            scalar: true
          }
        },
        data: {
          scalar: 'foo',
          json: {
            scalar: 123
          }
        }
      }
    );

    assert.equal(
      statement,
      `UPDATE ONLY "ez4-test-update-schema" SET "scalar" = :0, "json"['scalar'] = :1 ` +
        `RETURNING "scalar", json_build_object('scalar', "json"['scalar']) AS "json"`
    );

    assert.deepEqual(variables, [makeParameter('0', 'foo'), makeParameter('1', JSON.stringify(123), 'JSON')]);
  });

  it('assert :: prepare update schema (invalid scalar field type)', async ({ assert }) => {
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
            data: {
              // The `column` can't be string as per schema definition.
              column: 'foo'
            }
          }
        ),
      MalformedRequestError
    );
  });

  it('assert :: prepare update schema (invalid extra scalar field)', async ({ assert }) => {
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
            data: {
              // Extra fields aren't expected on json.
              foo: 'foo'
            }
          }
        ),
      MissingFieldSchemaError
    );
  });

  it('assert :: prepare update schema (invalid json field type)', async ({ assert }) => {
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
            data: {
              json: {
                // The `column` can't be numeric as per schema definition.
                column: 123
              }
            }
          }
        ),
      MalformedRequestError
    );
  });

  it('assert :: prepare update schema (invalid extra json field)', async ({ assert }) => {
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
            data: {
              json: {
                // Extra fields aren't expected on json.
                foo: 'foo'
              }
            }
          }
        ),
      MissingFieldSchemaError
    );
  });
});
