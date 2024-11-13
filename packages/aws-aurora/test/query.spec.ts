import { equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  prepareDeleteQuery,
  prepareInsertQuery,
  prepareSelectQuery,
  prepareUpdateQuery
} from '@ez4/aws-aurora/client';

import { ObjectSchema, SchemaTypeName } from '@ez4/schema';
import { Index, Order, Query } from '@ez4/database';

type TestSchema = {
  id: string;
  foo?: number;
  bar: {
    barFoo?: string;
    barBar?: boolean;
  };
};

type TestRelations = {
  relation1?: TestSchema;
  relation2?: TestSchema;
};

type TestIndexes = {
  id: Index.Primary;
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

  const testRelations = {
    relation1: {
      sourceSchema: testSchema,
      sourceTable: 'ez4-test-relation',
      sourceAlias: 'ez4-test-relation',
      targetAlias: 'relation1',
      targetColumn: 'relation1_id',
      sourceColumn: 'id',
      foreign: false
    },
    relation2: {
      sourceSchema: testSchema,
      sourceTable: 'ez4-test-relation',
      sourceAlias: 'ez4-test-relation',
      targetAlias: 'relation2',
      targetColumn: 'relation2_id',
      sourceColumn: 'id',
      foreign: false
    }
  };

  const getWhereOperation = (where: Query.WhereInput<TestSchema>) => {
    const [statement, variables] = prepareSelectQuery<TestSchema, TestIndexes, TestRelations, {}>(
      'ez4-test-where-operation',
      testSchema,
      testRelations,
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

  it.only('assert :: prepare insert', () => {
    const [statement, variables] = prepareInsertQuery<TestSchema, TestIndexes, TestRelations>(
      'ez4-test-insert',
      testSchema,
      testRelations,
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

    equal(statement, `INSERT INTO "ez4-test-insert" ("id", "foo", "bar") VALUES (:0i, :1i, :2i)`);

    deepEqual(variables, [
      {
        name: '0i',
        typeHint: 'UUID',
        value: {
          stringValue: 'abc'
        }
      },
      {
        name: '1i',
        value: {
          longValue: 123
        }
      },
      {
        name: '2i',
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

  it.only('assert :: prepare insert (with relationship)', () => {
    const [statement, variables] = prepareInsertQuery<TestSchema, TestIndexes, TestRelations>(
      'ez4-test-insert',
      testSchema,
      testRelations,
      {
        data: {
          id: 'abc',
          bar: {},
          relation1: {
            id: 'def',
            bar: {
              barBar: true
            }
          },
          relation2: {
            id: 'ghi',
            bar: {
              barFoo: 'test'
            }
          }
        }
      }
    );

    equal(
      statement,
      `WITH ` +
        `R1 AS (INSERT INTO "ez4-test-relation" ("id", "bar") ` +
        `VALUES (:0i, :1i) RETURNING "id" AS "relation1"), ` +
        `R2 AS (INSERT INTO "ez4-test-relation" ("id", "bar") ` +
        `VALUES (:2i, :3i) RETURNING "id" AS "relation2", R1."relation1") ` +
        `INSERT INTO "ez4-test-insert" ("id", "bar", "relation1_id", "relation2_id") ` +
        `SELECT :4i, :5i, "relation1", "relation2" FROM R2`
    );

    deepEqual(variables, [
      {
        name: '0i',
        typeHint: 'UUID',
        value: {
          stringValue: 'def'
        }
      },
      {
        name: '1i',
        typeHint: 'JSON',
        value: {
          stringValue: JSON.stringify({
            barBar: true
          })
        }
      },
      {
        name: '2i',
        typeHint: 'UUID',
        value: {
          stringValue: 'ghi'
        }
      },
      {
        name: '3i',
        typeHint: 'JSON',
        value: {
          stringValue: JSON.stringify({
            barFoo: 'test'
          })
        }
      },
      {
        name: '4i',
        typeHint: 'UUID',
        value: {
          stringValue: 'abc'
        }
      },
      {
        name: '5i',
        typeHint: 'JSON',
        value: {
          stringValue: '{}'
        }
      }
    ]);
  });

  it.only('assert :: prepare update', () => {
    const [statement, variables] = prepareUpdateQuery<TestSchema, TestIndexes, TestRelations, {}>(
      'ez4-test-update',
      testSchema,
      testRelations,
      {
        data: {
          id: 'new',
          foo: 456
        },
        where: {
          foo: 123
        }
      }
    );

    equal(statement, `UPDATE "ez4-test-update" SET "id" = :0i, "foo" = :1i WHERE "foo" = :0`);

    deepEqual(variables, [
      {
        name: '0i',
        typeHint: 'UUID',
        value: {
          stringValue: 'new'
        }
      },
      {
        name: '1i',
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

  it.only('assert :: prepare update (with relationship)', () => {
    const [statement, variables] = prepareUpdateQuery<TestSchema, TestIndexes, TestRelations, {}>(
      'ez4-test-update',
      testSchema,
      testRelations,
      {
        data: {
          id: 'new',
          relation1: {
            foo: 123
          },
          relation2: {
            bar: {
              barFoo: 'test'
            }
          }
        },
        where: {
          foo: 456
        }
      }
    );

    equal(
      statement,
      `WITH ` +
        `R1 AS (UPDATE "ez4-test-update" SET "id" = :2i WHERE "foo" = :0 RETURNING "relation1_id", "relation2_id"), ` +
        `R2 AS (UPDATE "ez4-test-relation" SET "foo" = :0i FROM R1 WHERE "id" = R1."relation1_id" RETURNING R1.*) ` +
        `UPDATE "ez4-test-relation" SET "bar"['barFoo'] = :1i ` +
        `FROM R2 ` +
        `WHERE "id" = R2."relation2_id" ` +
        `RETURNING R2.*`
    );

    deepEqual(variables, [
      {
        name: '0i',
        value: {
          longValue: 123
        }
      },
      {
        name: '1i',
        value: {
          stringValue: 'test'
        }
      },
      {
        name: '2i',
        typeHint: 'UUID',
        value: {
          stringValue: 'new'
        }
      },
      {
        name: '0',
        value: {
          longValue: 456
        }
      }
    ]);
  });

  it.only('assert :: prepare update (with select)', () => {
    const [statement, variables] = prepareUpdateQuery<TestSchema, TestIndexes, TestRelations, {}>(
      'ez4-test-update',
      testSchema,
      testRelations,
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
      `UPDATE "ez4-test-update" ` +
        `SET "foo" = :0i, "bar"['barBar'] = :1i ` +
        `WHERE "id" = :0 ` +
        `RETURNING "foo", json_build_object('barBar', "bar"['barBar']) AS "bar"`
    );

    deepEqual(variables, [
      {
        name: '0i',
        value: {
          longValue: 456
        }
      },
      {
        name: '1i',
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

  it.only('assert :: prepare select', () => {
    const [statement, variables] = prepareSelectQuery<TestSchema, TestIndexes, TestRelations, {}>(
      'ez4-test-select',
      testSchema,
      testRelations,
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
        `WHERE "foo" = :0 ` +
        `ORDER BY "id" DESC`
    );

    deepEqual(variables, [
      {
        name: '0',
        value: {
          longValue: 123
        }
      }
    ]);
  });

  it.only('assert :: prepare select (with relationship)', () => {
    const [statement, variables] = prepareSelectQuery<TestSchema, TestIndexes, TestRelations, {}>(
      'ez4-test-select',
      testSchema,
      testRelations,
      {
        select: {
          id: true,
          foo: true,
          bar: true,
          relation1: {
            id: true
          },
          relation2: true
        },
        where: {
          id: 'abc'
        }
      }
    );

    equal(
      statement,
      `SELECT "id", "foo", "bar", ` +
        `(SELECT json_build_object('id', "id") ` +
        `FROM "ez4-test-relation" WHERE "id" = "relation1_id") AS "relation1", ` +
        `(SELECT json_build_object('id', "id", 'foo', "foo", 'bar', "bar") ` +
        `FROM "ez4-test-relation" WHERE "id" = "relation2_id") AS "relation2" ` +
        `FROM "ez4-test-select" ` +
        `WHERE "id" = :0`
    );

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

  it.only('assert :: prepare delete', () => {
    const [statement, variables] = prepareDeleteQuery<TestSchema, TestIndexes, TestRelations, {}>(
      'ez4-test-delete',
      testSchema,
      testRelations,
      {
        where: {
          id: 'abc'
        }
      }
    );

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

  it.only('assert :: prepare delete (with select)', () => {
    const [statement, variables] = prepareDeleteQuery<TestSchema, TestIndexes, TestRelations, {}>(
      'ez4-test-delete',
      testSchema,
      testRelations,
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
