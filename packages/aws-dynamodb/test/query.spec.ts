import { equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ObjectSchema, SchemaTypeName } from '@ez4/schema';
import { Index, Order, Query } from '@ez4/database';

import {
  prepareDelete,
  prepareInsert,
  prepareSelect,
  prepareUpdate
} from '@ez4/aws-dynamodb/client';

type TestSchema = {
  id: string;
  foo: number;
  bar: {
    barFoo: string;
    barBar: boolean;
  };
};

type TestIndexes = {
  id: Index.Primary;
};

describe.only('dynamodb query', () => {
  const testSchema: ObjectSchema = {
    type: SchemaTypeName.Object,
    properties: {
      id: {
        type: SchemaTypeName.String
      },
      foo: {
        type: SchemaTypeName.Number
      },
      bar: {
        type: SchemaTypeName.Object,
        properties: {
          barFoo: {
            type: SchemaTypeName.String
          },
          barBar: {
            type: SchemaTypeName.Boolean
          }
        }
      }
    }
  };

  const getWhereOperation = (where: Query.WhereInput<TestSchema>) => {
    const [statement, variables] = prepareSelect<TestSchema, {}, {}, {}>(
      'ez4-test-where-operation',
      undefined,
      {
        select: {
          id: true
        },
        where
      }
    );

    const whereStatement = statement.substring(statement.indexOf('WHERE'));

    return [whereStatement, variables];
  };

  it('assert :: prepare insert', () => {
    const [statement, variables] = prepareInsert<TestSchema, TestIndexes, {}>(
      'ez4-test-insert',
      testSchema,
      {
        data: {
          id: 'abc',
          foo: 123,
          bar: {
            barFoo: 'def',
            barBar: true
          }
        }
      }
    );

    equal(statement, `INSERT INTO "ez4-test-insert" value { 'id': ?, 'foo': ?, 'bar': ? }`);

    deepEqual(variables, ['abc', 123, { barFoo: 'def', barBar: true }]);
  });

  it('assert :: prepare update', () => {
    const [statement, variables] = prepareUpdate<TestSchema, TestIndexes, {}, {}>(
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

  it('assert :: prepare update (with select)', () => {
    const [statement, variables] = prepareUpdate<TestSchema, TestIndexes, {}, {}>(
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

  it('assert :: prepare select', () => {
    const [statement, variables] = prepareSelect<TestSchema, TestIndexes, {}, {}>(
      'ez4-test-select',
      undefined,
      {
        select: {
          id: true,
          foo: true,
          bar: true
        },
        where: {
          foo: 123
        },
        order: {
          id: Order.Desc
        }
      }
    );

    equal(
      statement,
      `SELECT "id", "foo", "bar" ` +
        `FROM "ez4-test-select" ` +
        `WHERE "foo" = ? ` +
        `ORDER BY "id" DESC`
    );

    deepEqual(variables, [123]);
  });

  it('assert :: prepare select (with index)', () => {
    const [statement, variables] = prepareSelect<TestSchema, TestIndexes, {}, {}>(
      'ez4-test-select',
      'foo-index',
      {
        select: {
          id: true
        },
        where: {
          foo: 123
        }
      }
    );

    equal(statement, `SELECT "id" FROM "ez4-test-select"."foo-index" WHERE "foo" = ?`);

    deepEqual(variables, [123]);
  });

  it('assert :: prepare delete', () => {
    const [statement, variables] = prepareDelete<TestSchema, TestIndexes, {}, {}>(
      'ez4-test-delete',
      {
        where: {
          id: 'abc'
        }
      }
    );

    equal(statement, `DELETE FROM "ez4-test-delete" WHERE "id" = ?`);

    deepEqual(variables, ['abc']);
  });

  it('assert :: prepare delete (with select)', () => {
    const [statement, variables] = prepareDelete<TestSchema, TestIndexes, {}, {}>(
      'ez4-test-delete',
      {
        select: {
          id: true,
          foo: true,
          bar: true
        },
        where: {
          id: 'abc'
        }
      }
    );

    equal(statement, `DELETE FROM "ez4-test-delete" WHERE "id" = ? RETURNING ALL OLD *`);

    deepEqual(variables, ['abc']);
  });

  it('assert :: prepare where (default)', () => {
    const [whereStatement, variables] = getWhereOperation({
      id: 'abc',
      foo: 123
    });

    equal(whereStatement, `WHERE "id" = ? AND "foo" = ?`);

    deepEqual(variables, ['abc', 123]);
  });

  it('assert :: prepare where (equal)', () => {
    const [whereStatement, variables] = getWhereOperation({
      id: { equal: 'abc' }
    });

    equal(whereStatement, `WHERE "id" = ?`);

    deepEqual(variables, ['abc']);
  });

  it('assert :: prepare where (not equal)', () => {
    const [whereStatement, variables] = getWhereOperation({
      id: { not: 'abc' }
    });

    equal(whereStatement, `WHERE "id" != ?`);

    deepEqual(variables, ['abc']);
  });

  it('assert :: prepare where (greater than)', () => {
    const [whereStatement, variables] = getWhereOperation({
      foo: { gt: 0 }
    });

    equal(whereStatement, `WHERE "foo" > ?`);

    deepEqual(variables, [0]);
  });

  it('assert :: prepare where (greater than or equal)', () => {
    const [whereStatement, variables] = getWhereOperation({
      foo: { gte: 0 }
    });

    equal(whereStatement, `WHERE "foo" >= ?`);

    deepEqual(variables, [0]);
  });

  it('assert :: prepare where (less than)', () => {
    const [whereStatement, variables] = getWhereOperation({
      foo: { lt: 0 }
    });

    equal(whereStatement, `WHERE "foo" < ?`);

    deepEqual(variables, [0]);
  });

  it('assert :: prepare where (less than or equal)', () => {
    const [whereStatement, variables] = getWhereOperation({
      foo: { lte: 0 }
    });

    equal(whereStatement, `WHERE "foo" <= ?`);

    deepEqual(variables, [0]);
  });

  it('assert :: prepare where (is in)', () => {
    const [whereStatement, variables] = getWhereOperation({
      id: { isIn: ['abc', 'def'] }
    });

    equal(whereStatement, `WHERE "id" IN [?, ?]`);

    deepEqual(variables, ['abc', 'def']);
  });

  it('assert :: prepare where (is between)', () => {
    const [whereStatement, variables] = getWhereOperation({
      foo: { isBetween: [0, 100] }
    });

    equal(whereStatement, `WHERE "foo" BETWEEN ? AND ?`);

    deepEqual(variables, [0, 100]);
  });

  it('assert :: prepare where (is missing)', () => {
    const [whereStatement, variables] = getWhereOperation({
      bar: { barBar: { isMissing: true } }
    });

    equal(whereStatement, `WHERE "bar"."barBar" IS MISSING`);

    deepEqual(variables, []);
  });

  it('assert :: prepare where (is not missing)', () => {
    const [whereStatement, variables] = getWhereOperation({
      bar: { barBar: { isMissing: false } }
    });

    equal(whereStatement, `WHERE "bar"."barBar" IS NOT MISSING`);

    deepEqual(variables, []);
  });

  it('assert :: prepare where (is null)', () => {
    const [whereStatement, variables] = getWhereOperation({
      bar: { barBar: { isNull: true } }
    });

    equal(whereStatement, `WHERE "bar"."barBar" IS NULL`);

    deepEqual(variables, []);
  });

  it('assert :: prepare where (is not null)', () => {
    const [whereStatement, variables] = getWhereOperation({
      bar: { barBar: { isNull: false } }
    });

    equal(whereStatement, `WHERE "bar"."barBar" IS NOT NULL`);

    deepEqual(variables, []);
  });

  it('assert :: prepare where (contains)', () => {
    const [whereStatement, variables] = getWhereOperation({
      bar: { barFoo: { contains: 'abc' } }
    });

    equal(whereStatement, `WHERE contains("bar"."barFoo", ?)`);

    deepEqual(variables, ['abc']);
  });

  it('assert :: prepare where (starts with)', () => {
    const [whereStatement, variables] = getWhereOperation({
      bar: { barFoo: { startsWith: 'abc' } }
    });

    equal(whereStatement, `WHERE begins_with("bar"."barFoo", ?)`);

    deepEqual(variables, ['abc']);
  });

  it('assert :: prepare where (not)', () => {
    const [whereStatement, variables] = getWhereOperation({
      NOT: { id: 'abc', foo: 123 }
    });

    equal(whereStatement, `WHERE NOT ("id" = ? AND "foo" = ?)`);

    deepEqual(variables, ['abc', 123]);
  });

  it('assert :: prepare where (and)', () => {
    const [whereStatement, variables] = getWhereOperation({
      AND: [{ foo: 123, id: 'abc' }, { OR: [{ foo: 456 }, { foo: 789 }] }]
    });

    equal(whereStatement, `WHERE "foo" = ? AND "id" = ? AND ("foo" = ? OR "foo" = ?)`);

    deepEqual(variables, [123, 'abc', 456, 789]);
  });

  it('assert :: prepare where (or)', () => {
    const [whereStatement, variables] = getWhereOperation({
      OR: [{ id: 'abc', foo: 123 }, { AND: [{ id: 'def' }, { id: 'ghi' }] }]
    });

    equal(whereStatement, `WHERE (("id" = ? AND "foo" = ?) OR ("id" = ? AND "id" = ?))`);

    deepEqual(variables, ['abc', 123, 'def', 'ghi']);
  });
});
