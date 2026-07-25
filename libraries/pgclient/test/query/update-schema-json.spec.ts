import type { Query, RelationMetadata } from '@ez4/database';
import type { PostgresEngine } from '@ez4/pgclient/library';
import type { ObjectSchema } from '@ez4/schema';

import { describe, it } from 'node:test';

import { MalformedRequestError } from '@ez4/pgclient';
import { prepareUpdateQuery } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';
import { SqlBuilder } from '@ez4/pgsql';

type TestTableMetadata = {
  engine: PostgresEngine;
  relations: RelationMetadata;
  indexes: {};
  schema: {};
};

describe('update json schema', () => {
  const prepareUpdate = async <S extends Query.SelectInput<TestTableMetadata>>(
    schema: ObjectSchema,
    query: Query.UpdateManyInput<S, TestTableMetadata>
  ) => {
    const builder = new SqlBuilder();

    const allQueries = await prepareUpdateQuery(builder, 'ez4-test-update-schema', schema, {}, query);

    return builder.with(allQueries).build();
  };

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

    assert.deepEqual(variables, [true, false]);
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

    assert.deepEqual(variables, [123]);
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

    assert.deepEqual(variables, ['foo']);
  });

  it('assert :: prepare update schema (json nullable field)', async ({ assert }) => {
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

    assert.deepEqual(variables, [null]);
  });

  it('assert :: prepare update schema (json optional field)', async ({ assert }) => {
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

  it('assert :: prepare update schema (json optional and required fields)', async ({ assert }) => {
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

  it('assert :: prepare update schema (json nullable column)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate(
      {
        type: SchemaType.Object,
        properties: {
          json: {
            type: SchemaType.Object,
            nullable: true,
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
          json: null
        }
      }
    );

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-schema" SET "json" = null`);

    assert.deepEqual(variables, []);
  });

  it('assert :: prepare update schema (json optional column)', async ({ assert }) => {
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

    assert.equal(
      statement,
      `UPDATE ONLY "ez4-test-update-schema" SET "json" = COALESCE("json", '{}'::jsonb) || jsonb_build_object('optional', :0)`
    );

    assert.deepEqual(variables, [123]);
  });

  it('assert :: prepare update schema (json additional field)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate(
      {
        type: SchemaType.Object,
        properties: {
          json: {
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
      },
      {
        data: {
          json: {
            foo: 123,
            bar: 456
          }
        }
      }
    );

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-schema" SET "json"['foo'] = :0, "json"['bar'] = :1`);

    assert.deepEqual(variables, [123, 456]);
  });

  it('assert :: prepare update schema (json additional nullish field)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate(
      {
        type: SchemaType.Object,
        properties: {
          json: {
            type: SchemaType.Object,
            optional: true,
            nullable: true,
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
      },
      {
        data: {
          json: {
            foo: 123,
            bar: 456
          }
        }
      }
    );

    assert.equal(
      statement,
      `UPDATE ONLY "ez4-test-update-schema" SET "json" = COALESCE("json", '{}'::jsonb) || jsonb_build_object('foo', :0, 'bar', :1)`
    );

    assert.deepEqual(variables, [123, 456]);
  });

  it('assert :: prepare update schema (json unknown field)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate(
      {
        type: SchemaType.Object,
        properties: {
          json: {
            type: SchemaType.Object,
            properties: {},
            definitions: {
              extensible: true
            }
          }
        }
      },
      {
        data: {
          json: {
            foo: 123,
            bar: 'bar',
            baz: true
          }
        }
      }
    );

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-schema" SET "json"['foo'] = :0, "json"['bar'] = :1, "json"['baz'] = :2`);

    assert.deepEqual(variables, [123, 'bar', true]);
  });

  it('assert :: prepare update schema (json unknown nullish field)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate(
      {
        type: SchemaType.Object,
        properties: {
          json: {
            type: SchemaType.Object,
            optional: true,
            nullable: true,
            properties: {},
            definitions: {
              extensible: true
            }
          }
        }
      },
      {
        data: {
          json: {
            foo: 123,
            bar: 'bar',
            baz: true
          }
        }
      }
    );

    assert.equal(
      statement,
      `UPDATE ONLY "ez4-test-update-schema" SET "json" = COALESCE("json", '{}'::jsonb) || jsonb_build_object('foo', :0, 'bar', :1, 'baz', :2)`
    );

    assert.deepEqual(variables, [123, 'bar', true]);
  });

  it('assert :: prepare update schema (json unexpected field)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate(
      {
        type: SchemaType.Object,
        properties: {
          json: {
            type: SchemaType.Object,
            properties: {
              foo: {
                type: SchemaType.Number
              }
            }
          }
        }
      },
      {
        data: {
          json: {
            foo: 123,
            bar: 'extra'
          }
        }
      }
    );

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-schema" SET "json"['foo'] = :0`);

    assert.deepEqual(variables, [123]);
  });

  it('assert :: prepare update schema (json union field)', async ({ assert }) => {
    const schema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        json: {
          type: SchemaType.Union,
          elements: [
            {
              type: SchemaType.Object,
              properties: {
                foo: {
                  type: SchemaType.Number
                },
                bar: {
                  type: SchemaType.String
                }
              }
            },
            {
              type: SchemaType.Object,
              properties: {
                baz: {
                  type: SchemaType.String
                },
                qux: {
                  type: SchemaType.Number
                }
              }
            }
          ]
        }
      }
    };

    const [statementA, variablesA] = await prepareUpdate(schema, {
      data: {
        json: {
          foo: 123
        }
      }
    });

    const [statementB, variablesB] = await prepareUpdate(schema, {
      data: {
        json: {
          baz: 'abc'
        }
      }
    });

    assert.equal(statementA, `UPDATE ONLY "ez4-test-update-schema" SET "json"['foo'] = :0`);
    assert.equal(statementB, `UPDATE ONLY "ez4-test-update-schema" SET "json"['baz'] = :0`);

    assert.deepEqual(variablesA, [123]);
    assert.deepEqual(variablesB, ['abc']);
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
});
