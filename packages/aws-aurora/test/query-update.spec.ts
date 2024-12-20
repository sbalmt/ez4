import { equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { prepareUpdateQuery } from '@ez4/aws-aurora/client';
import { ObjectSchema, SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

import { makeParameter } from './common/parameters.js';

type TestSchema = {
  id: string;
  foo?: number;
  relation1_id?: string;
  relation2_id?: string;
  bar: {
    barFoo?: string;
    barBar?: boolean;
  };
};

type TestRelations = {
  indexes: 'relation1_id' | 'relation2_id';
  selects: {
    relation1?: TestSchema;
    relation2?: TestSchema;
    relations?: TestSchema[];
  };
  changes: {
    relation1?: TestSchema | { relation1_id: string };
    relation2?: TestSchema | { relation2_id: string };
    relations?: TestSchema[];
  };
};

type TestIndexes = {
  id: Index.Primary;
  relation1_id: Index.Secondary;
  relation2_id: Index.Secondary;
};

describe.only('aurora query (update)', () => {
  const testSchema: ObjectSchema = {
    type: SchemaType.Object,
    properties: {
      id: {
        type: SchemaType.String,
        format: 'uuid'
      },
      relation1_id: {
        type: SchemaType.String,
        optional: true,
        format: 'uuid'
      },
      relation2_id: {
        type: SchemaType.String,
        optional: true,
        format: 'uuid'
      },
      foo: {
        type: SchemaType.Number,
        optional: true
      },
      bar: {
        type: SchemaType.Object,
        properties: {
          barFoo: {
            type: SchemaType.String,
            optional: true
          },
          barBar: {
            type: SchemaType.Boolean,
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
      foreign: true
    },
    relation2: {
      sourceSchema: testSchema,
      sourceTable: 'ez4-test-relation',
      sourceAlias: 'ez4-test-relation',
      targetAlias: 'relation2',
      targetColumn: 'relation2_id',
      sourceColumn: 'id',
      foreign: true
    },
    relations: {
      sourceSchema: testSchema,
      sourceTable: 'ez4-test-relation',
      sourceAlias: 'ez4-test-relation',
      targetAlias: 'relations',
      targetColumn: 'id',
      sourceColumn: 'relation2_id',
      foreign: false
    }
  };

  it('assert :: prepare update', () => {
    const [statement, variables] = prepareUpdateQuery<TestSchema, TestIndexes, TestRelations, {}>(
      'ez4-test-update',
      testSchema,
      testRelations,
      {
        data: {
          id: '00000000-0000-0000-0000-000000000000',
          foo: 456
        },
        where: {
          foo: 123
        }
      }
    );

    equal(statement, `UPDATE "ez4-test-update" SET "id" = :0i, "foo" = :1i WHERE "foo" = :0`);

    deepEqual(variables, [
      makeParameter('0i', '00000000-0000-0000-0000-000000000000', 'UUID'),
      makeParameter('1i', 456),
      makeParameter('0', 123)
    ]);
  });

  it('assert :: prepare update (with select)', () => {
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
          foo: 123,
          bar: {
            barBar: false
          }
        },
        where: {
          id: '00000000-0000-0000-0000-000000000000'
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
      makeParameter('0i', 123),
      makeParameter('1i', false),
      makeParameter('0', '00000000-0000-0000-0000-000000000000', 'UUID')
    ]);
  });

  it('assert :: prepare update (foreign relationship ids)', () => {
    const [statement, variables] = prepareUpdateQuery<TestSchema, TestIndexes, TestRelations, {}>(
      'ez4-test-update',
      testSchema,
      testRelations,
      {
        data: {
          id: '00000000-0000-0000-0000-000000000000',
          relation1: {
            relation1_id: '00000000-0000-0000-0000-000000000001'
          },
          relation2: {
            relation2_id: '00000000-0000-0000-0000-000000000002'
          }
        },
        where: {
          foo: 456
        }
      }
    );

    equal(
      statement,
      // Main record
      `UPDATE "ez4-test-update" SET "id" = :0i, relation1_id = :1i, relation2_id = :2i ` +
        `WHERE "foo" = :0`
    );

    deepEqual(variables, [
      makeParameter('0i', '00000000-0000-0000-0000-000000000000', 'UUID'),
      makeParameter('1i', '00000000-0000-0000-0000-000000000001', 'UUID'),
      makeParameter('2i', '00000000-0000-0000-0000-000000000002', 'UUID'),
      makeParameter('0', 456)
    ]);
  });

  it('assert :: prepare update (foreign relationship object)', () => {
    const [statement, variables] = prepareUpdateQuery<TestSchema, TestIndexes, TestRelations, {}>(
      'ez4-test-update',
      testSchema,
      testRelations,
      {
        data: {
          id: '00000000-0000-0000-0000-000000000000',
          relation1: {
            foo: 123
          },
          relation2: {
            bar: {
              barFoo: 'abc'
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
        // Main record
        `R1 AS (UPDATE "ez4-test-update" SET "id" = :0i ` +
        `WHERE "foo" = :0 RETURNING "relation1_id", "relation2_id"), ` +
        // First relation
        `R2 AS (UPDATE "ez4-test-relation" AS T SET "foo" = :1i ` +
        `FROM R1 WHERE T."id" = R1."relation1_id") ` +
        // Second relation
        `UPDATE "ez4-test-relation" AS T SET "bar"['barFoo'] = :2i ` +
        `FROM R1 WHERE T."id" = R1."relation2_id"`
    );

    deepEqual(variables, [
      makeParameter('0i', '00000000-0000-0000-0000-000000000000', 'UUID'),
      makeParameter('0', 456),
      makeParameter('1i', 123),
      makeParameter('2i', 'abc')
    ]);
  });

  it('assert :: prepare update (inverse relationship object)', () => {
    const [statement, variables] = prepareUpdateQuery<TestSchema, TestIndexes, TestRelations, {}>(
      'ez4-test-update',
      testSchema,
      testRelations,
      {
        data: {
          id: '00000000-0000-0000-0000-000000000000',
          relations: {
            foo: 123
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
        // Main record
        `R1 AS (UPDATE "ez4-test-update" SET "id" = :0i ` +
        `WHERE "foo" = :0 RETURNING "id") ` +
        // First relation
        `UPDATE "ez4-test-relation" AS T SET "foo" = :1i ` +
        `FROM R1 WHERE T."relation2_id" = R1."id"`
    );

    deepEqual(variables, [
      makeParameter('0i', '00000000-0000-0000-0000-000000000000', 'UUID'),
      makeParameter('0', 456),
      makeParameter('1i', 123)
    ]);
  });

  it('assert :: prepare update (foreign and inverse relationships)', () => {
    const [statement, variables] = prepareUpdateQuery<TestSchema, TestIndexes, TestRelations, {}>(
      'ez4-test-update',
      testSchema,
      testRelations,
      {
        data: {
          id: '00000000-0000-0000-0000-000000000000',
          relation1: {
            bar: {
              barFoo: 'abc'
            }
          },
          relations: {
            foo: 123
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
        // Main record
        `R1 AS (UPDATE "ez4-test-update" SET "id" = :0i ` +
        `WHERE "foo" = :0 RETURNING "relation1_id", "id"), ` +
        // First relation
        `R2 AS (UPDATE "ez4-test-relation" AS T SET "bar"['barFoo'] = :1i ` +
        `FROM R1 WHERE T."id" = R1."relation1_id") ` +
        // Second relation
        `UPDATE "ez4-test-relation" AS T SET "foo" = :2i ` +
        `FROM R1 WHERE T."relation2_id" = R1."id"`
    );

    deepEqual(variables, [
      makeParameter('0i', '00000000-0000-0000-0000-000000000000', 'UUID'),
      makeParameter('0', 456),
      makeParameter('1i', 'abc'),
      makeParameter('2i', 123)
    ]);
  });

  it('assert :: prepare update (only relationships)', () => {
    const [statement, variables] = prepareUpdateQuery<TestSchema, TestIndexes, TestRelations, {}>(
      'ez4-test-update',
      testSchema,
      testRelations,
      {
        data: {
          relation1: {
            bar: {
              barFoo: 'abc'
            }
          },
          relations: {
            foo: 123
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
        // Main record
        `R1 AS (SELECT "relation1_id", "id" ` +
        `FROM "ez4-test-update" WHERE "foo" = :0), ` +
        // First relation
        `R2 AS (UPDATE "ez4-test-relation" AS T SET "bar"['barFoo'] = :0i ` +
        `FROM R1 WHERE T."id" = R1."relation1_id") ` +
        // Second relation
        `UPDATE "ez4-test-relation" AS T SET "foo" = :1i ` +
        `FROM R1 WHERE T."relation2_id" = R1."id"`
    );

    deepEqual(variables, [
      makeParameter('0', 456),
      makeParameter('0i', 'abc'),
      makeParameter('1i', 123)
    ]);
  });
});
