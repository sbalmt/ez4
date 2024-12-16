import { equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { prepareInsertQuery } from '@ez4/aws-aurora/client';
import { ObjectSchema, SchemaType } from '@ez4/schema';

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
    relations?: TestSchema[];
  };
  changes: {
    relation1?: TestSchema | { relation1_id: string };
    relation2?: TestSchema | { relation2_id: string };
    relations?: TestSchema[];
  };
};

describe.only('aurora query (insert)', () => {
  const testSchema: ObjectSchema = {
    type: SchemaType.Object,
    identity: 0,
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
        identity: 1,
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

  it('assert :: prepare insert', () => {
    const [statement, variables] = prepareInsertQuery<TestSchema, TestRelations>(
      'ez4-test-insert',
      testSchema,
      testRelations,
      {
        data: {
          id: '00000000-0000-0000-0000-000000000000',
          foo: 123,
          bar: {
            barFoo: 'abc',
            barBar: true
          }
        }
      }
    );

    equal(statement, `INSERT INTO "ez4-test-insert" ("id", "foo", "bar") VALUES (:0i, :1i, :2i)`);

    deepEqual(variables, [
      makeParameter('0i', '00000000-0000-0000-0000-000000000000', 'UUID'),
      makeParameter('1i', 123),
      makeParameter('2i', { barFoo: 'abc', barBar: true })
    ]);
  });

  it('assert :: prepare insert (foreign relationship ids)', () => {
    const [statement, variables] = prepareInsertQuery<TestSchema, TestRelations>(
      'ez4-test-insert',
      testSchema,
      testRelations,
      {
        data: {
          id: '00000000-0000-0000-0000-000000000000',
          bar: {},
          relation1: {
            relation1_id: '00000000-0000-0000-0000-000000000001'
          },
          relation2: {
            relation2_id: '00000000-0000-0000-0000-000000000002'
          }
        }
      }
    );

    equal(
      statement,
      // Main record
      `INSERT INTO "ez4-test-insert" ("id", "bar", "relation1_id", "relation2_id") ` +
        `VALUES (:0i, :1i, :2i, :3i)`
    );

    deepEqual(variables, [
      makeParameter('0i', '00000000-0000-0000-0000-000000000000', 'UUID'),
      makeParameter('1i', {}),
      makeParameter('2i', '00000000-0000-0000-0000-000000000001', 'UUID'),
      makeParameter('3i', '00000000-0000-0000-0000-000000000002', 'UUID')
    ]);
  });

  it('assert :: prepare insert (foreign relationship object)', () => {
    const [statement, variables] = prepareInsertQuery<TestSchema, TestRelations>(
      'ez4-test-insert',
      testSchema,
      testRelations,
      {
        data: {
          id: '00000000-0000-0000-0000-000000000000',
          bar: {},
          relation1: {
            id: '00000000-0000-0000-0000-000000000001',
            bar: {
              barBar: true
            }
          },
          relation2: {
            id: '00000000-0000-0000-0000-000000000002',
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
        `R1 AS (INSERT INTO "ez4-test-relation" ("id", "bar") ` +
        `VALUES (:0i, :1i) RETURNING "id" AS "relation1"), ` +
        // Second relation
        `R2 AS (INSERT INTO "ez4-test-relation" ("id", "bar") ` +
        `VALUES (:2i, :3i) RETURNING "id" AS "relation2", R1.*) ` +
        // Main record
        `INSERT INTO "ez4-test-insert" ("id", "bar", "relation1_id", "relation2_id") ` +
        `SELECT :4i, :5i, "relation1", "relation2" FROM R2`
    );

    deepEqual(variables, [
      makeParameter('0i', '00000000-0000-0000-0000-000000000001', 'UUID'),
      makeParameter('1i', { barBar: true }),
      makeParameter('2i', '00000000-0000-0000-0000-000000000002', 'UUID'),
      makeParameter('3i', { barFoo: 'abc' }),
      makeParameter('4i', '00000000-0000-0000-0000-000000000000', 'UUID'),
      makeParameter('5i', {})
    ]);
  });

  it('assert :: prepare insert (inverse relationship array)', () => {
    const [statement, variables] = prepareInsertQuery<TestSchema, TestRelations>(
      'ez4-test-insert',
      testSchema,
      testRelations,
      {
        data: {
          id: '00000000-0000-0000-0000-000000000000',
          bar: {},
          relations: [
            {
              id: '00000000-0000-0000-0000-000000000001',
              bar: {
                barBar: true
              }
            },
            {
              id: '00000000-0000-0000-0000-000000000002',
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
        `R1 AS (INSERT INTO "ez4-test-insert" ("id", "bar") ` +
        `VALUES (:0i, :1i) RETURNING "id"), ` +
        // First relation
        `R2 AS (INSERT INTO "ez4-test-relation" ("id", "bar", "relation2_id") ` +
        `SELECT :2i, :3i, "id" FROM R1) ` +
        // Second relation
        `INSERT INTO "ez4-test-relation" ("id", "bar", "relation2_id") ` +
        `SELECT :4i, :5i, "id" FROM R1`
    );

    deepEqual(variables, [
      makeParameter('0i', '00000000-0000-0000-0000-000000000000', 'UUID'),
      makeParameter('1i', {}),
      makeParameter('2i', '00000000-0000-0000-0000-000000000001', 'UUID'),
      makeParameter('3i', { barBar: true }),
      makeParameter('4i', '00000000-0000-0000-0000-000000000002', 'UUID'),
      makeParameter('5i', { barFoo: 'abc' })
    ]);
  });

  it('assert :: prepare insert (foreign and inverse relationships)', () => {
    const [statement, variables] = prepareInsertQuery<TestSchema, TestRelations>(
      'ez4-test-insert',
      testSchema,
      testRelations,
      {
        data: {
          id: '00000000-0000-0000-0000-000000000000',
          bar: {},
          relation1: {
            id: '00000000-0000-0000-0000-000000000001',
            bar: {
              barBar: true
            }
          },
          relations: [
            {
              id: '00000000-0000-0000-0000-000000000002',
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
        // First relation
        `R1 AS (INSERT INTO "ez4-test-relation" ("id", "bar") ` +
        `VALUES (:0i, :1i) RETURNING "id" AS "relation1"), ` +
        // Main record
        `R2 AS (INSERT INTO "ez4-test-insert" ("id", "bar", "relation1_id") ` +
        `SELECT :2i, :3i, "relation1" FROM R1 RETURNING "id") ` +
        // Second relation
        `INSERT INTO "ez4-test-relation" ("id", "bar", "relation2_id") ` +
        `SELECT :4i, :5i, "id" FROM R2`
    );

    deepEqual(variables, [
      makeParameter('0i', '00000000-0000-0000-0000-000000000001', 'UUID'),
      makeParameter('1i', { barBar: true }),
      makeParameter('2i', '00000000-0000-0000-0000-000000000000', 'UUID'),
      makeParameter('3i', {}),
      makeParameter('4i', '00000000-0000-0000-0000-000000000002', 'UUID'),
      makeParameter('5i', { barFoo: 'abc' })
    ]);
  });
});
