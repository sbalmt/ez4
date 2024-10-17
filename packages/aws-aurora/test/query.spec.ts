import { equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { prepareDelete, prepareInsert, prepareSelect, prepareUpdate } from '@ez4/aws-aurora/client';

import { ObjectSchema, SchemaTypeName } from '@ez4/schema';
import { Query } from '@ez4/database';

type TestSchema = {
  id: string;
  foo: number;
  bar: {
    barFoo: string;
    barBar: boolean;
  };
};

const getWhereOperation = (schema: ObjectSchema, where: Query.WhereInput<TestSchema>) => {
  const [statement, variables] = prepareSelect<TestSchema>('ez4-test-where-operation', schema, {
    select: {
      id: true
    },
    where
  });

  const whereStatement = statement.substring(statement.indexOf('WHERE'));

  return [whereStatement, variables];
};

describe.only('aurora query', () => {
  const testSchema: ObjectSchema = {
    type: SchemaTypeName.Object,
    properties: {
      id: {
        type: SchemaTypeName.String,
        format: 'uuid'
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

  it('assert :: prepare insert', () => {
    const [statement, variables] = prepareInsert<TestSchema>('ez4-test-insert', testSchema, {
      data: {
        id: 'abc',
        foo: 123,
        bar: {
          barFoo: 'def',
          barBar: true
        }
      }
    });

    equal(statement, `INSERT INTO "ez4-test-insert" ("id", "foo", "bar") VALUES (:i0, :i1, :i2)`);

    deepEqual(variables, [
      {
        name: 'i0',
        typeHint: 'UUID',
        value: {
          stringValue: 'abc'
        }
      },
      {
        name: 'i1',
        value: {
          longValue: 123
        }
      },
      {
        name: 'i2',
        typeHint: 'JSON',
        value: {
          stringValue: JSON.stringify({
            barFoo: 'def',
            barBar: true
          })
        }
      }
    ]);
  });

  it('assert :: prepare update', () => {
    const [statement, variables] = prepareUpdate<TestSchema>('ez4-test-update', testSchema, {
      data: {
        foo: 456
      },
      where: {
        foo: 123
      }
    });

    equal(statement, `UPDATE "ez4-test-update" SET "foo" = :u0 WHERE "foo" = :0`);

    deepEqual(variables, [
      {
        name: 'u0',
        value: {
          longValue: 456
        }
      },
      {
        name: '0',
        value: {
          longValue: 123
        }
      }
    ]);
  });

  it('assert :: prepare update (with select)', () => {
    const [statement, variables] = prepareUpdate<TestSchema>('ez4-test-update', testSchema, {
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

    equal(
      statement,
      `UPDATE "ez4-test-update" ` +
        `SET "foo" = :u0 ` +
        `SET "bar"['barBar'] = :u1 ` +
        `WHERE "id" = :0 ` +
        `RETURNING "foo", JSONB_BUILD_OBJECT('barBar', "bar"['barBar']) AS "bar"`
    );

    deepEqual(variables, [
      {
        name: 'u0',
        value: {
          longValue: 456
        }
      },
      {
        name: 'u1',
        value: {
          booleanValue: false
        }
      },
      {
        name: '0',
        typeHint: 'UUID',
        value: {
          stringValue: 'abc'
        }
      }
    ]);
  });

  it('assert :: prepare select', () => {
    const [statement, variables] = prepareSelect<TestSchema>('ez4-test-select', testSchema, {
      select: {
        id: true,
        foo: true,
        bar: true
      },
      where: {
        foo: 123
      }
    });

    equal(statement, `SELECT "id", "foo", "bar" FROM "ez4-test-select" WHERE "foo" = :0`);

    deepEqual(variables, [
      {
        name: '0',
        value: {
          longValue: 123
        }
      }
    ]);
  });

  it('assert :: prepare delete', () => {
    const [statement, variables] = prepareDelete<TestSchema>('ez4-test-delete', testSchema, {
      where: {
        id: 'abc'
      }
    });

    equal(statement, `DELETE FROM "ez4-test-delete" WHERE "id" = :0`);

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

  it('assert :: prepare delete (with select)', () => {
    const [statement, variables] = prepareDelete<TestSchema>('ez4-test-delete', testSchema, {
      select: {
        id: true,
        foo: true,
        bar: true
      },
      where: {
        id: 'abc'
      }
    });

    equal(statement, `DELETE FROM "ez4-test-delete" WHERE "id" = :0 RETURNING "id", "foo", "bar"`);

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

  it('assert :: prepare where (default)', () => {
    const [whereStatement, variables] = getWhereOperation(testSchema, {
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

  it('assert :: prepare where (equal)', () => {
    const [whereStatement, variables] = getWhereOperation(testSchema, {
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

  it('assert :: prepare where (not equal)', () => {
    const [whereStatement, variables] = getWhereOperation(testSchema, {
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

  it('assert :: prepare where (greater than)', () => {
    const [whereStatement, variables] = getWhereOperation(testSchema, {
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

  it('assert :: prepare where (greater than or equal)', () => {
    const [whereStatement, variables] = getWhereOperation(testSchema, {
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

  it('assert :: prepare where (less than)', () => {
    const [whereStatement, variables] = getWhereOperation(testSchema, {
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

  it('assert :: prepare where (less than or equal)', () => {
    const [whereStatement, variables] = getWhereOperation(testSchema, {
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

  it('assert :: prepare where (is in)', () => {
    const [whereStatement, variables] = getWhereOperation(testSchema, {
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

  it('assert :: prepare where (is between)', () => {
    const [whereStatement, variables] = getWhereOperation(testSchema, {
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

  it('assert :: prepare where (is missing)', () => {
    const [whereStatement, variables] = getWhereOperation(testSchema, {
      bar: { barBar: { isMissing: true } }
    });

    equal(whereStatement, `WHERE "bar"['barBar'] IS NULL`);

    deepEqual(variables, []);
  });

  it('assert :: prepare where (is not missing)', () => {
    const [whereStatement, variables] = getWhereOperation(testSchema, {
      bar: { barBar: { isMissing: false } }
    });

    equal(whereStatement, `WHERE "bar"['barBar'] IS NOT NULL`);

    deepEqual(variables, []);
  });

  it('assert :: prepare where (is null)', () => {
    const [whereStatement, variables] = getWhereOperation(testSchema, {
      bar: { barBar: { isNull: true } }
    });

    equal(whereStatement, `WHERE "bar"['barBar'] IS NULL`);

    deepEqual(variables, []);
  });

  it('assert :: prepare where (is not null)', () => {
    const [whereStatement, variables] = getWhereOperation(testSchema, {
      bar: { barBar: { isNull: false } }
    });

    equal(whereStatement, `WHERE "bar"['barBar'] IS NOT NULL`);

    deepEqual(variables, []);
  });

  it('assert :: prepare where (contains)', () => {
    const [whereStatement, variables] = getWhereOperation(testSchema, {
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

  it('assert :: prepare where (starts with)', () => {
    const [whereStatement, variables] = getWhereOperation(testSchema, {
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

  it('assert :: prepare where (not)', () => {
    const [whereStatement, variables] = getWhereOperation(testSchema, {
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

  it('assert :: prepare where (and)', () => {
    const [whereStatement, variables] = getWhereOperation(testSchema, {
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

  it('assert :: prepare where (or)', () => {
    const [whereStatement, variables] = getWhereOperation(testSchema, {
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
