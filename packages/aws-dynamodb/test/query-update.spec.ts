import { equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ObjectSchema, SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

import { prepareUpdate } from '@ez4/aws-dynamodb/client';

type TestSchema = {
  id: string;
  foo?: number | null;
  bar: {
    barFoo: string;
    barBar: boolean;
  };
};

type TestRelations = {
  indexes: never;
  filters: {};
  selects: {};
  changes: {};
};

type TestIndexes = {
  id: Index.Primary;
};

describe.only('dynamodb query (update)', () => {
  const testSchema: ObjectSchema = {
    type: SchemaType.Object,
    properties: {
      id: {
        type: SchemaType.String
      },
      foo: {
        type: SchemaType.Number,
        nullable: true,
        optional: true,
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
    const [statement, variables] = prepareUpdate<TestSchema, {}, TestIndexes, TestRelations>(
      'ez4-test-update',
      testSchema,
      {
        data: {
          foo: 456
        },
        where: {
          foo: 123
        }
      }
    );

    equal(statement, `UPDATE "ez4-test-update" SET "foo" = ? WHERE "foo" = ?`);

    deepEqual(variables, [456, 123]);
  });

  it('assert :: prepare update (remove nulls)', () => {
    const [statement, variables] = prepareUpdate<TestSchema, {}, TestIndexes, TestRelations>(
      'ez4-test-update',
      testSchema,
      {
        data: {
          foo: null,
          bar: {
            barFoo: 'abc'
          }
        }
      }
    );

    equal(statement, `UPDATE "ez4-test-update" REMOVE "foo" SET "bar"."barFoo" = ?`);

    deepEqual(variables, ['abc']);
  });

  it('assert :: prepare update (with select)', () => {
    const [statement, variables] = prepareUpdate<TestSchema, {}, TestIndexes, TestRelations>(
      'ez4-test-update',
      testSchema,
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
        }
      }
    );

    equal(
      statement,
      `UPDATE "ez4-test-update" SET "foo" = ? SET "bar"."barBar" = ? WHERE "id" = ? RETURNING ALL OLD *`
    );

    deepEqual(variables, [456, false, 'abc']);
  });
});
