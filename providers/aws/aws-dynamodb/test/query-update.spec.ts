import type { DynamoDbEngine } from '@ez4/aws-dynamodb/client';
import type { Index, RelationMetadata } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';

import { equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { prepareUpdate } from '@ez4/aws-dynamodb/client';
import { SchemaType } from '@ez4/schema';

type TestTableMetadata = {
  engine: DynamoDbEngine;
  relations: RelationMetadata;
  indexes: {
    id: Index.Primary;
  };
  schema: {
    id: string;
    foo?: number | null;
    bar: {
      barFoo: string;
      barBar: boolean;
    };
  };
};

describe('dynamodb query (update)', () => {
  const testSchema: ObjectSchema = {
    type: SchemaType.Object,
    properties: {
      id: {
        type: SchemaType.String
      },
      foo: {
        type: SchemaType.Number,
        nullable: true,
        optional: true
      },
      bar: {
        type: SchemaType.Object,
        properties: {
          barFoo: {
            type: SchemaType.String
          },
          barBar: {
            type: SchemaType.Boolean
          }
        }
      }
    }
  };

  it('assert :: prepare update', () => {
    const [statement, variables] = prepareUpdate<TestTableMetadata, {}>('ez4-test-update', testSchema, {
      data: {
        foo: 456
      },
      where: {
        foo: 123
      }
    });

    equal(statement, `UPDATE "ez4-test-update" SET "foo" = ? WHERE "foo" = ?`);

    deepEqual(variables, [456, 123]);
  });

  it('assert :: prepare update (remove nulls)', () => {
    const [statement, variables] = prepareUpdate<TestTableMetadata, {}>('ez4-test-update', testSchema, {
      data: {
        foo: null,
        bar: {
          barFoo: 'abc'
        }
      }
    });

    equal(statement, `UPDATE "ez4-test-update" REMOVE "foo" SET "bar"."barFoo" = ?`);

    deepEqual(variables, ['abc']);
  });

  it('assert :: prepare update (with select)', () => {
    const [statement, variables] = prepareUpdate<TestTableMetadata, {}>('ez4-test-update', testSchema, {
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
      }
    });

    equal(statement, `UPDATE "ez4-test-update" SET "foo" = ? SET "bar"."barBar" = ? WHERE "id" = ? RETURNING ALL OLD *`);

    deepEqual(variables, [456, false, 'abc']);
  });
});
