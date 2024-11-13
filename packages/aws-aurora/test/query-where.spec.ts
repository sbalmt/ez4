import { equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { prepareSelectQuery } from '@ez4/aws-aurora/client';

import { ObjectSchema, SchemaTypeName } from '@ez4/schema';
import { Index, Query } from '@ez4/database';

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

  it.only('assert :: prepare where (default)', () => {
    const [whereStatement, variables] = getWhereOperation({
      id: 'abc',
      foo: 123
    });

    equal(whereStatement, `WHERE "id" = :0 AND "foo" = :1`);

    deepEqual(variables, [
      {
        name: '0',
        typeHint: 'UUID',
        value: {
          stringValue: 'abc'
        }
      },
      {
        name: '1',
        value: {
          longValue: 123
        }
      }
    ]);
  });

  it.only('assert :: prepare where (equal)', () => {
    const [whereStatement, variables] = getWhereOperation({
      id: { equal: 'abc' }
    });

    equal(whereStatement, `WHERE "id" = :0`);

    deepEqual(variables, [
      {
        name: '0',
        typeHint: 'UUID',
        value: {
          stringValue: 'abc'
        }
      }
    ]);
  });

  it.only('assert :: prepare where (not equal)', () => {
    const [whereStatement, variables] = getWhereOperation({
      id: { not: 'abc' }
    });

    equal(whereStatement, `WHERE "id" != :0`);

    deepEqual(variables, [
      {
        name: '0',
        typeHint: 'UUID',
        value: {
          stringValue: 'abc'
        }
      }
    ]);
  });

  it.only('assert :: prepare where (greater than)', () => {
    const [whereStatement, variables] = getWhereOperation({
      foo: { gt: 0 }
    });

    equal(whereStatement, `WHERE "foo" > :0`);

    deepEqual(variables, [
      {
        name: '0',
        value: {
          longValue: 0
        }
      }
    ]);
  });

  it.only('assert :: prepare where (greater than or equal)', () => {
    const [whereStatement, variables] = getWhereOperation({
      foo: { gte: 0 }
    });

    equal(whereStatement, `WHERE "foo" >= :0`);

    deepEqual(variables, [
      {
        name: '0',
        value: {
          longValue: 0
        }
      }
    ]);
  });

  it.only('assert :: prepare where (less than)', () => {
    const [whereStatement, variables] = getWhereOperation({
      foo: { lt: 0 }
    });

    equal(whereStatement, `WHERE "foo" < :0`);

    deepEqual(variables, [
      {
        name: '0',
        value: {
          longValue: 0
        }
      }
    ]);
  });

  it.only('assert :: prepare where (less than or equal)', () => {
    const [whereStatement, variables] = getWhereOperation({
      foo: { lte: 0 }
    });

    equal(whereStatement, `WHERE "foo" <= :0`);

    deepEqual(variables, [
      {
        name: '0',
        value: {
          longValue: 0
        }
      }
    ]);
  });

  it.only('assert :: prepare where (is in)', () => {
    const [whereStatement, variables] = getWhereOperation({
      id: { isIn: ['abc', 'def'] }
    });

    equal(whereStatement, `WHERE "id" IN (:0, :1)`);

    deepEqual(variables, [
      {
        name: '0',
        typeHint: 'UUID',
        value: {
          stringValue: 'abc'
        }
      },
      {
        name: '1',
        typeHint: 'UUID',
        value: {
          stringValue: 'def'
        }
      }
    ]);
  });

  it.only('assert :: prepare where (is between)', () => {
    const [whereStatement, variables] = getWhereOperation({
      foo: { isBetween: [0, 100] }
    });

    equal(whereStatement, `WHERE "foo" BETWEEN :0 AND :1`);

    deepEqual(variables, [
      {
        name: '0',
        value: {
          longValue: 0
        }
      },
      {
        name: '1',
        value: {
          longValue: 100
        }
      }
    ]);
  });

  it.only('assert :: prepare where (is missing)', () => {
    const [whereStatement, variables] = getWhereOperation({
      bar: { barBar: { isMissing: true } }
    });

    equal(whereStatement, `WHERE "bar"['barBar'] IS NULL`);

    deepEqual(variables, []);
  });

  it.only('assert :: prepare where (is not missing)', () => {
    const [whereStatement, variables] = getWhereOperation({
      bar: { barBar: { isMissing: false } }
    });

    equal(whereStatement, `WHERE "bar"['barBar'] IS NOT NULL`);

    deepEqual(variables, []);
  });

  it.only('assert :: prepare where (is null)', () => {
    const [whereStatement, variables] = getWhereOperation({
      bar: { barBar: { isNull: true } }
    });

    equal(whereStatement, `WHERE "bar"['barBar'] IS NULL`);

    deepEqual(variables, []);
  });

  it.only('assert :: prepare where (is not null)', () => {
    const [whereStatement, variables] = getWhereOperation({
      bar: { barBar: { isNull: false } }
    });

    equal(whereStatement, `WHERE "bar"['barBar'] IS NOT NULL`);

    deepEqual(variables, []);
  });

  it.only('assert :: prepare where (contains)', () => {
    const [whereStatement, variables] = getWhereOperation({
      bar: { barFoo: { contains: 'abc' } }
    });

    equal(whereStatement, `WHERE "bar"['barFoo'] LIKE '%' || :0 || '%'`);

    deepEqual(variables, [
      {
        name: '0',
        value: {
          stringValue: 'abc'
        }
      }
    ]);
  });

  it.only('assert :: prepare where (starts with)', () => {
    const [whereStatement, variables] = getWhereOperation({
      bar: { barFoo: { startsWith: 'abc' } }
    });

    equal(whereStatement, `WHERE "bar"['barFoo'] LIKE :0 || '%'`);

    deepEqual(variables, [
      {
        name: '0',
        value: {
          stringValue: 'abc'
        }
      }
    ]);
  });

  it.only('assert :: prepare where (not)', () => {
    const [whereStatement, variables] = getWhereOperation({
      NOT: { id: 'abc', foo: 123 }
    });

    equal(whereStatement, `WHERE NOT ("id" = :0 AND "foo" = :1)`);

    deepEqual(variables, [
      {
        name: '0',
        typeHint: 'UUID',
        value: {
          stringValue: 'abc'
        }
      },
      {
        name: '1',
        value: {
          longValue: 123
        }
      }
    ]);
  });

  it.only('assert :: prepare where (and)', () => {
    const [whereStatement, variables] = getWhereOperation({
      AND: [{ foo: 123, id: 'abc' }, { OR: [{ foo: 456 }, { foo: 789 }] }]
    });

    equal(whereStatement, `WHERE "foo" = :0 AND "id" = :1 AND ("foo" = :2 OR "foo" = :3)`);

    deepEqual(variables, [
      {
        name: '0',
        value: {
          longValue: 123
        }
      },
      {
        name: '1',
        typeHint: 'UUID',
        value: {
          stringValue: 'abc'
        }
      },
      {
        name: '2',
        value: {
          longValue: 456
        }
      },
      {
        name: '3',
        value: {
          longValue: 789
        }
      }
    ]);
  });

  it.only('assert :: prepare where (or)', () => {
    const [whereStatement, variables] = getWhereOperation({
      OR: [{ id: 'abc', foo: 123 }, { AND: [{ id: 'def' }, { id: 'ghi' }] }]
    });

    equal(whereStatement, `WHERE (("id" = :0 AND "foo" = :1) OR ("id" = :2 AND "id" = :3))`);

    deepEqual(variables, [
      {
        name: '0',
        typeHint: 'UUID',
        value: {
          stringValue: 'abc'
        }
      },
      {
        name: '1',
        value: {
          longValue: 123
        }
      },
      {
        name: '2',
        typeHint: 'UUID',
        value: {
          stringValue: 'def'
        }
      },
      {
        name: '3',
        typeHint: 'UUID',
        value: {
          stringValue: 'ghi'
        }
      }
    ]);
  });
});
