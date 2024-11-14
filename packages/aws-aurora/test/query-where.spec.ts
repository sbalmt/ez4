import { equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { prepareSelectQuery } from '@ez4/aws-aurora/client';

import { ObjectSchema, SchemaTypeName } from '@ez4/schema';
import { Index, Query } from '@ez4/database';

import { makeParameter } from './common/parameters.js';

type TestSchema = {
  id: string;
  foo?: number;
  bar: {
    barFoo?: string;
    barBar?: boolean;
  };
};

type TestIndexes = {
  id: Index.Primary;
};

describe.only('aurora query where', () => {
  const testSchema: ObjectSchema = {
    type: SchemaTypeName.Object,
    properties: {
      id: {
        type: SchemaTypeName.String,
        format: 'uuid'
      },
      foo: {
        type: SchemaTypeName.Number,
        optional: true
      },
      bar: {
        type: SchemaTypeName.Object,
        properties: {
          barFoo: {
            type: SchemaTypeName.String,
            optional: true
          },
          barBar: {
            type: SchemaTypeName.Boolean,
            optional: true
          }
        }
      }
    }
  };

  const getWhereOperation = (where: Query.WhereInput<TestSchema>) => {
    const [statement, variables] = prepareSelectQuery<TestSchema, TestIndexes, {}, {}>(
      'ez4-test-where-operation',
      testSchema,
      {},
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

  it('assert :: prepare where (default)', () => {
    const [whereStatement, variables] = getWhereOperation({
      id: '00000000-0000-0000-0000-000000000000',
      foo: 123
    });

    equal(whereStatement, `WHERE "id" = :0 AND "foo" = :1`);

    deepEqual(variables, [
      makeParameter('0', '00000000-0000-0000-0000-000000000000', 'UUID'),
      makeParameter('1', 123)
    ]);
  });

  it('assert :: prepare where (equal)', () => {
    const [whereStatement, variables] = getWhereOperation({
      id: { equal: '00000000-0000-0000-0000-000000000000' }
    });

    equal(whereStatement, `WHERE "id" = :0`);

    deepEqual(variables, [makeParameter('0', '00000000-0000-0000-0000-000000000000', 'UUID')]);
  });

  it('assert :: prepare where (not equal)', () => {
    const [whereStatement, variables] = getWhereOperation({
      id: { not: '00000000-0000-0000-0000-000000000000' }
    });

    equal(whereStatement, `WHERE "id" != :0`);

    deepEqual(variables, [makeParameter('0', '00000000-0000-0000-0000-000000000000', 'UUID')]);
  });

  it('assert :: prepare where (greater than)', () => {
    const [whereStatement, variables] = getWhereOperation({
      foo: { gt: 0 }
    });

    equal(whereStatement, `WHERE "foo" > :0`);

    deepEqual(variables, [makeParameter('0', 0)]);
  });

  it('assert :: prepare where (greater than or equal)', () => {
    const [whereStatement, variables] = getWhereOperation({
      foo: { gte: 0 }
    });

    equal(whereStatement, `WHERE "foo" >= :0`);

    deepEqual(variables, [makeParameter('0', 0)]);
  });

  it('assert :: prepare where (less than)', () => {
    const [whereStatement, variables] = getWhereOperation({
      foo: { lt: 0 }
    });

    equal(whereStatement, `WHERE "foo" < :0`);

    deepEqual(variables, [makeParameter('0', 0)]);
  });

  it('assert :: prepare where (less than or equal)', () => {
    const [whereStatement, variables] = getWhereOperation({
      foo: { lte: 0 }
    });

    equal(whereStatement, `WHERE "foo" <= :0`);

    deepEqual(variables, [makeParameter('0', 0)]);
  });

  it('assert :: prepare where (is in)', () => {
    const [whereStatement, variables] = getWhereOperation({
      id: { isIn: ['00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001'] }
    });

    equal(whereStatement, `WHERE "id" IN (:0, :1)`);

    deepEqual(variables, [
      makeParameter('0', '00000000-0000-0000-0000-000000000000', 'UUID'),
      makeParameter('1', '00000000-0000-0000-0000-000000000001', 'UUID')
    ]);
  });

  it('assert :: prepare where (is between)', () => {
    const [whereStatement, variables] = getWhereOperation({
      foo: { isBetween: [0, 100] }
    });

    equal(whereStatement, `WHERE "foo" BETWEEN :0 AND :1`);

    deepEqual(variables, [makeParameter('0', 0), makeParameter('1', 100)]);
  });

  it('assert :: prepare where (is missing)', () => {
    const [whereStatement, variables] = getWhereOperation({
      bar: { barBar: { isMissing: true } }
    });

    equal(whereStatement, `WHERE "bar"['barBar'] IS NULL`);

    deepEqual(variables, []);
  });

  it('assert :: prepare where (is not missing)', () => {
    const [whereStatement, variables] = getWhereOperation({
      bar: { barBar: { isMissing: false } }
    });

    equal(whereStatement, `WHERE "bar"['barBar'] IS NOT NULL`);

    deepEqual(variables, []);
  });

  it('assert :: prepare where (is null)', () => {
    const [whereStatement, variables] = getWhereOperation({
      bar: { barBar: { isNull: true } }
    });

    equal(whereStatement, `WHERE "bar"['barBar'] IS NULL`);

    deepEqual(variables, []);
  });

  it('assert :: prepare where (is not null)', () => {
    const [whereStatement, variables] = getWhereOperation({
      bar: { barBar: { isNull: false } }
    });

    equal(whereStatement, `WHERE "bar"['barBar'] IS NOT NULL`);

    deepEqual(variables, []);
  });

  it('assert :: prepare where (contains)', () => {
    const [whereStatement, variables] = getWhereOperation({
      bar: { barFoo: { contains: 'abc' } }
    });

    equal(whereStatement, `WHERE "bar"['barFoo'] LIKE '%' || :0 || '%'`);

    deepEqual(variables, [makeParameter('0', 'abc')]);
  });

  it('assert :: prepare where (starts with)', () => {
    const [whereStatement, variables] = getWhereOperation({
      bar: { barFoo: { startsWith: 'abc' } }
    });

    equal(whereStatement, `WHERE "bar"['barFoo'] LIKE :0 || '%'`);

    deepEqual(variables, [makeParameter('0', 'abc')]);
  });

  it('assert :: prepare where (not)', () => {
    const [whereStatement, variables] = getWhereOperation({
      NOT: { id: '00000000-0000-0000-0000-000000000000', foo: 123 }
    });

    equal(whereStatement, `WHERE NOT ("id" = :0 AND "foo" = :1)`);

    deepEqual(variables, [
      makeParameter('0', '00000000-0000-0000-0000-000000000000', 'UUID'),
      makeParameter('1', 123)
    ]);
  });

  it('assert :: prepare where (and)', () => {
    const [whereStatement, variables] = getWhereOperation({
      AND: [
        { foo: 123, id: '00000000-0000-0000-0000-000000000000' },
        { OR: [{ foo: 456 }, { foo: 789 }] }
      ]
    });

    equal(whereStatement, `WHERE "foo" = :0 AND "id" = :1 AND ("foo" = :2 OR "foo" = :3)`);

    deepEqual(variables, [
      makeParameter('0', 123),
      makeParameter('1', '00000000-0000-0000-0000-000000000000', 'UUID'),
      makeParameter('2', 456),
      makeParameter('3', 789)
    ]);
  });

  it('assert :: prepare where (or)', () => {
    const [whereStatement, variables] = getWhereOperation({
      OR: [
        { id: '00000000-0000-0000-0000-000000000000', foo: 123 },
        {
          AND: [
            { id: '00000000-0000-0000-0000-000000000001' },
            { id: '00000000-0000-0000-0000-000000000002' }
          ]
        }
      ]
    });

    equal(whereStatement, `WHERE (("id" = :0 AND "foo" = :1) OR ("id" = :2 AND "id" = :3))`);

    deepEqual(variables, [
      makeParameter('0', '00000000-0000-0000-0000-000000000000', 'UUID'),
      makeParameter('1', 123),
      makeParameter('2', '00000000-0000-0000-0000-000000000001', 'UUID'),
      makeParameter('3', '00000000-0000-0000-0000-000000000002', 'UUID')
    ]);
  });
});
