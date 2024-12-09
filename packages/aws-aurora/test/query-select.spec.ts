import { equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { prepareSelectQuery } from '@ez4/aws-aurora/client';
import { ObjectSchema, SchemaType } from '@ez4/schema';
import { Index, Order } from '@ez4/database';

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

type TestIndexes = {
  id: Index.Primary;
  relation1_id: Index.Secondary;
  relation2_id: Index.Secondary;
};

describe.only('aurora query (select)', () => {
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

  it('assert :: prepare select', () => {
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

    deepEqual(variables, [makeParameter('0', 123)]);
  });

  it('assert :: prepare select (with relationship)', () => {
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
          relation2: true,
          relations: {
            foo: true
          }
        },
        where: {
          id: '00000000-0000-0000-0000-000000000000'
        }
      }
    );

    equal(
      statement,
      `SELECT "id", "foo", "bar", ` +
        // First relation
        `(SELECT json_build_object('id', "id") ` +
        `FROM "ez4-test-relation" WHERE "id" = R."relation1_id") AS "relation1", ` +
        // Second relation
        `(SELECT json_build_object('id', "id", 'relation1_id', "relation1_id", 'relation2_id', "relation2_id", 'foo', "foo", 'bar', "bar") ` +
        `FROM "ez4-test-relation" WHERE "id" = R."relation2_id") AS "relation2", ` +
        // Third relation
        `(SELECT COALESCE(json_agg(json_build_object('foo', "foo")), '[]'::json) ` +
        `FROM "ez4-test-relation" WHERE "relation2_id" = R."id") AS "relations" ` +
        //
        `FROM "ez4-test-select" R ` +
        `WHERE "id" = :0`
    );

    deepEqual(variables, [makeParameter('0', '00000000-0000-0000-0000-000000000000', 'UUID')]);
  });

  it('assert :: prepare select (all)', () => {
    const [statement, variables] = prepareSelectQuery<TestSchema, TestIndexes, TestRelations, {}>(
      'ez4-test-select',
      testSchema,
      testRelations,
      {
        select: {}
      }
    );

    equal(
      statement,
      `SELECT "id", "relation1_id", "relation2_id", "foo", "bar" FROM "ez4-test-select"`
    );

    deepEqual(variables, []);
  });
});
