import { equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { prepareInsertQuery } from '@ez4/aws-aurora/client';
import { ObjectSchema, SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

import { makeParameter } from './common/parameters.js';

type TestSchema = {
  id: string;
  relation1_id?: string;
  relation2_id?: string;
  foo?: number;
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
    relation3?: TestSchema;
    relations?: TestSchema[];
  };
  changes: {
    relation1?: TestSchema | { relation1_id: string };
    relation2?: TestSchema | { relation2_id: string };
    relation3?: TestSchema | { relation3_id: string };
    relations?: TestSchema[];
  };
};

describe.only('aurora query (insert)', () => {
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
      relation3_id: {
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
      sourceIndex: Index.Primary,
      targetIndex: Index.Secondary
    },
    relation2: {
      sourceSchema: testSchema,
      sourceTable: 'ez4-test-relation',
      sourceAlias: 'ez4-test-relation',
      targetAlias: 'relation2',
      targetColumn: 'id',
      sourceColumn: 'relation2_id',
      sourceIndex: Index.Unique,
      targetIndex: Index.Primary
    },
    relation3: {
      sourceSchema: testSchema,
      sourceTable: 'ez4-test-relation',
      sourceAlias: 'ez4-test-relation',
      targetAlias: 'relation3',
      targetColumn: 'relation3_id',
      sourceColumn: 'id',
      sourceIndex: Index.Primary,
      targetIndex: Index.Secondary
    },
    relations: {
      sourceSchema: testSchema,
      sourceTable: 'ez4-test-relation',
      sourceAlias: 'ez4-test-relation',
      targetAlias: 'relations',
      targetColumn: 'id',
      sourceColumn: 'relation1_id',
      sourceIndex: Index.Secondary,
      targetIndex: Index.Primary
    }
  };

  it('assert :: prepare insert', () => {
    const [statement, variables] = prepareInsertQuery<TestSchema, TestRelations>(
      'ez4-test-insert',
      testSchema,
      testRelations,
      {
        data: {
          id: '00000000-0000-1000-9000-000000000000',
          foo: 123,
          bar: {
            barFoo: 'abc',
            barBar: true
          }
        }
      }
    );

    equal(statement, `INSERT INTO "ez4-test-insert" ("id", "foo", "bar") VALUES (:0, :1, :2)`);

    deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', 123),
      makeParameter('2', { barFoo: 'abc', barBar: true })
    ]);
  });

  it('assert :: prepare insert (primary foreign id)', () => {
    const [statement, variables] = prepareInsertQuery<TestSchema, TestRelations>(
      'ez4-test-insert',
      testSchema,
      testRelations,
      {
        data: {
          id: '00000000-0000-1000-9000-000000000000',
          bar: {},
          relation1: {
            relation1_id: '00000000-0000-1000-9000-000000000001'
          }
        }
      }
    );

    equal(
      statement,
      // Main record
      `INSERT INTO "ez4-test-insert" ("id", "bar", "relation1_id") VALUES (:0, :1, :2)`
    );

    deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', {}),
      makeParameter('2', '00000000-0000-1000-9000-000000000001', 'UUID')
    ]);
  });

  it('assert :: prepare insert (primary foreign object)', () => {
    const [statement, variables] = prepareInsertQuery<TestSchema, TestRelations>(
      'ez4-test-insert',
      testSchema,
      testRelations,
      {
        data: {
          id: '00000000-0000-1000-9000-000000000000',
          bar: {},
          relation1: {
            id: '00000000-0000-1000-9000-000000000001',
            bar: {
              barBar: true
            }
          },
          relation3: {
            id: '00000000-0000-1000-9000-000000000002',
            bar: {
              barFoo: 'abc'
            }
          }
        }
      }
    );

    equal(
      statement,
      `WITH ` +
        // First relation
        `"R0" AS (INSERT INTO "ez4-test-relation" ("id", "bar") ` +
        `VALUES (:0, :1) RETURNING "id" AS "relation1"), ` +
        // Second relation
        `"R1" AS (INSERT INTO "ez4-test-relation" ("id", "bar") ` +
        `VALUES (:2, :3) RETURNING "id" AS "relation3", "R0".*) ` +
        // Main record
        `INSERT INTO "ez4-test-insert" ("id", "bar", "relation1_id", "relation3_id") ` +
        `SELECT :4, :5, "R1"."relation1", "R1"."relation3" FROM "R1"`
    );

    deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000001', 'UUID'),
      makeParameter('1', { barBar: true }),
      makeParameter('2', '00000000-0000-1000-9000-000000000002', 'UUID'),
      makeParameter('3', { barFoo: 'abc' }),
      makeParameter('4', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('5', {})
    ]);
  });

  it('assert :: prepare insert (unique foreign id)', () => {
    const [statement, variables] = prepareInsertQuery<TestSchema, TestRelations>(
      'ez4-test-insert',
      testSchema,
      testRelations,
      {
        data: {
          id: '00000000-0000-1000-9000-000000000000',
          bar: {},
          relation2: {
            relation2_id: '00000000-0000-1000-9000-000000000001'
          }
        }
      }
    );

    equal(
      statement,
      // Main record
      `INSERT INTO "ez4-test-insert" ("id", "bar", "relation2_id") VALUES (:0, :1, :2)`
    );

    deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', {}),
      makeParameter('2', '00000000-0000-1000-9000-000000000001', 'UUID')
    ]);
  });

  it('assert :: prepare insert (unique foreign object)', () => {
    const [statement, variables] = prepareInsertQuery<TestSchema, TestRelations>(
      'ez4-test-insert',
      testSchema,
      testRelations,
      {
        data: {
          id: '00000000-0000-1000-9000-000000000000',
          bar: {},
          relation2: {
            id: '00000000-0000-1000-9000-000000000001',
            bar: {
              barBar: true
            }
          }
        }
      }
    );

    equal(
      statement,
      `WITH ` +
        // Main record
        `"R0" AS (INSERT INTO "ez4-test-insert" ("id", "bar") ` +
        `VALUES (:0, :1) RETURNING "id") ` +
        // First relation
        `INSERT INTO "ez4-test-relation" ("id", "bar", "relation2_id") ` +
        `SELECT :2, :3, "R0"."id" FROM "R0"`
    );

    deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', {}),
      makeParameter('2', '00000000-0000-1000-9000-000000000001', 'UUID'),
      makeParameter('3', { barBar: true })
    ]);
  });

  it('assert :: prepare insert (inverse array object)', () => {
    const [statement, variables] = prepareInsertQuery<TestSchema, TestRelations>(
      'ez4-test-insert',
      testSchema,
      testRelations,
      {
        data: {
          id: '00000000-0000-1000-9000-000000000000',
          bar: {},
          relations: [
            {
              id: '00000000-0000-1000-9000-000000000001',
              bar: {
                barBar: true
              }
            },
            {
              id: '00000000-0000-1000-9000-000000000002',
              bar: {
                barFoo: 'abc'
              }
            }
          ]
        }
      }
    );

    equal(
      statement,
      `WITH ` +
        // Main record
        `"R0" AS (INSERT INTO "ez4-test-insert" ("id", "bar") ` +
        `VALUES (:0, :1) RETURNING "id"), ` +
        // First relation
        `"R1" AS (INSERT INTO "ez4-test-relation" ("id", "bar", "relation1_id") ` +
        `SELECT :2, :3, "R0"."id" FROM "R0") ` +
        // Second relation
        `INSERT INTO "ez4-test-relation" ("id", "bar", "relation1_id") ` +
        `SELECT :4, :5, "R0"."id" FROM "R0"`
    );

    deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', {}),
      makeParameter('2', '00000000-0000-1000-9000-000000000001', 'UUID'),
      makeParameter('3', { barBar: true }),
      makeParameter('4', '00000000-0000-1000-9000-000000000002', 'UUID'),
      makeParameter('5', { barFoo: 'abc' })
    ]);
  });

  it('assert :: prepare insert (foreign and inverse)', () => {
    const [statement, variables] = prepareInsertQuery<TestSchema, TestRelations>(
      'ez4-test-insert',
      testSchema,
      testRelations,
      {
        data: {
          id: '00000000-0000-1000-9000-000000000000',
          bar: {},
          relation1: {
            id: '00000000-0000-1000-9000-000000000001',
            bar: {
              barFoo: 'abc'
            }
          },
          relation2: {
            id: '00000000-0000-1000-9000-000000000002',
            bar: {
              barBar: false
            }
          },
          relations: [
            {
              id: '00000000-0000-1000-9000-000000000003',
              bar: {
                barFoo: 'def'
              }
            }
          ]
        }
      }
    );

    equal(
      statement,
      `WITH ` +
        // First relation (primary)
        `"R0" AS (INSERT INTO "ez4-test-relation" ("id", "bar") ` +
        `VALUES (:0, :1) RETURNING "id" AS "relation1"), ` +
        // Main record
        `"R1" AS (INSERT INTO "ez4-test-insert" ("id", "bar", "relation1_id") ` +
        `SELECT :2, :3, "R0"."relation1" FROM "R0" RETURNING "id"), ` +
        // Second relation (unique)
        `"R2" AS (INSERT INTO "ez4-test-relation" ("id", "bar", "relation2_id") ` +
        `SELECT :4, :5, "R1"."id" FROM "R1") ` +
        // Third relation (inverse)
        `INSERT INTO "ez4-test-relation" ("id", "bar", "relation1_id") ` +
        `SELECT :6, :7, "R1"."id" FROM "R1"`
    );

    deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000001', 'UUID'),
      makeParameter('1', { barFoo: 'abc' }),
      makeParameter('2', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('3', {}),
      makeParameter('4', '00000000-0000-1000-9000-000000000002', 'UUID'),
      makeParameter('5', { barBar: false }),
      makeParameter('6', '00000000-0000-1000-9000-000000000003', 'UUID'),
      makeParameter('7', { barFoo: 'def' })
    ]);
  });
});
