import type { DynamoDbEngine } from '@ez4/aws-dynamodb/client';
import type { Query, RelationMetadata } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';

import { equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { prepareUpdate } from '@ez4/aws-dynamodb/client';
import { SchemaType } from '@ez4/schema';

type TestTableMetadata = {
  engine: DynamoDbEngine;
  relations: RelationMetadata;
  indexes: {};
  schema: {};
};

describe('dynamodb query (update)', () => {
  const prepareQueryUpdate = async <S extends Query.SelectInput<TestTableMetadata>>(
    schema: ObjectSchema,
    input: Query.UpdateManyInput<S, TestTableMetadata>,
    indexes?: string[][]
  ) => {
    return prepareUpdate<TestTableMetadata, {}>('ez4-test-update', schema, indexes ?? [], input);
  };

  it('assert :: prepare update', async () => {
    const [statement, variables] = await prepareQueryUpdate(
      {
        type: SchemaType.Object,
        properties: {
          foo: {
            type: SchemaType.Number
          }
        }
      },
      {
        data: {
          foo: 456
        },
        where: {
          foo: 123
        } as any
      }
    );

    equal(statement, `UPDATE "ez4-test-update" SET "foo" = ? WHERE "foo" = ?`);

    deepEqual(variables, [456, 123]);
  });

  it('assert :: prepare update (to null)', async () => {
    const [statement, variables] = await prepareQueryUpdate(
      {
        type: SchemaType.Object,
        properties: {
          foo: {
            type: SchemaType.Number,
            nullable: true
          },
          bar: {
            type: SchemaType.Object,
            properties: {
              barFoo: {
                type: SchemaType.String
              }
            }
          }
        }
      },
      {
        data: {
          foo: null,
          bar: {
            barFoo: 'abc'
          }
        }
      }
    );

    equal(statement, `UPDATE "ez4-test-update" SET "foo" = null SET "bar"."barFoo" = ?`);

    deepEqual(variables, ['abc']);
  });

  it('assert :: prepare update (to null on index)', async () => {
    const [statement, variables] = await prepareQueryUpdate(
      {
        type: SchemaType.Object,
        properties: {
          foo: {
            type: SchemaType.Number,
            nullable: true
          }
        }
      },
      {
        data: {
          foo: null
        }
      },
      [['id', 'foo']]
    );

    equal(statement, `UPDATE "ez4-test-update" REMOVE "foo"`);

    deepEqual(variables, []);
  });

  it('assert :: prepare update (with select)', async () => {
    const [statement, variables] = await prepareQueryUpdate(
      {
        type: SchemaType.Object,
        properties: {
          id: {
            type: SchemaType.String
          },
          foo: {
            type: SchemaType.Number,
            nullable: true
          },
          bar: {
            type: SchemaType.Object,
            properties: {
              barBar: {
                type: SchemaType.Boolean
              }
            }
          }
        }
      },
      {
        select: {
          foo: true,
          bar: {
            barBar: true
          }
        },
        data: {
          foo: 456,
          bar: {
            barBar: false
          }
        },
        where: {
          id: 'abc'
        } as any
      }
    );

    equal(statement, `UPDATE "ez4-test-update" SET "foo" = ? SET "bar"."barBar" = ? WHERE "id" = ? RETURNING ALL OLD *`);

    deepEqual(variables, [456, false, 'abc']);
  });
});
