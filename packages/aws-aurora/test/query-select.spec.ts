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
  // Special
  date?: string;
  time?: string;
  timestamp?: string;
};

type TestRelations = {
  indexes: 'relation1_id' | 'relation2_id';
  filters: {
    relation1: TestSchema;
    relation2: TestSchema;
    relations: TestSchema;
  };
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
      },
      date: {
        type: SchemaType.String,
        optional: true,
        format: 'date'
      },
      time: {
        type: SchemaType.String,
        optional: true,
        format: 'time'
      },
      timestamp: {
        type: SchemaType.String,
        optional: true,
        format: 'date-time'
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

  it('assert :: prepare select (undefined columns)', () => {
    const [statement, variables] = prepareSelectQuery<TestSchema, {}, TestIndexes, TestRelations, false>(
      'ez4-test-select',
      testSchema,
      testRelations,
      {
        select: {}
      }
    );

    equal(
      statement,
      `SELECT ` +
        `"id", ` +
        `"relation1_id", ` +
        `"relation2_id", ` +
        `"foo", ` +
        `"bar", ` +
        `to_char("date", 'YYYY-MM-DD') AS "date", ` +
        `to_char("time", 'HH24:MI:SS.MS"Z"') AS "time", ` +
        `to_char("timestamp", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS "timestamp" ` +
        `FROM "ez4-test-select"`
    );

    deepEqual(variables, []);
  });

  it('assert :: prepare select (defined columns)', () => {
    const [statement, variables] = prepareSelectQuery<TestSchema, {}, TestIndexes, TestRelations, false>(
      'ez4-test-select',
      testSchema,
      testRelations,
      {
        select: {
          id: true,
          foo: true,
          bar: true
        }
      }
    );

    equal(statement, `SELECT "id", "foo", "bar" FROM "ez4-test-select"`);

    deepEqual(variables, []);
  });

  it('assert :: prepare select (with json columns)', () => {
    const [statement, variables] = prepareSelectQuery<TestSchema, {}, TestIndexes, TestRelations, false>(
      'ez4-test-select',
      testSchema,
      testRelations,
      {
        select: {
          id: true,
          bar: {
            barBar: true
          }
        }
      }
    );

    equal(statement, `SELECT "id", json_build_object('barBar', "bar"['barBar']) AS "bar" FROM "ez4-test-select"`);

    deepEqual(variables, []);
  });

  it('assert :: prepare select (with filters)', () => {
    const [statement, variables] = prepareSelectQuery<TestSchema, {}, TestIndexes, TestRelations, false>(
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
        }
      }
    );

    equal(statement, `SELECT "id", "foo", "bar" FROM "ez4-test-select" WHERE "foo" = :0`);

    deepEqual(variables, [makeParameter('0', 123)]);
  });

  it('assert :: prepare select (with order)', () => {
    const [statement, variables] = prepareSelectQuery<TestSchema, {}, TestIndexes, TestRelations, false>(
      'ez4-test-select',
      testSchema,
      testRelations,
      {
        select: {
          id: true,
          foo: true,
          bar: true
        },
        order: {
          id: Order.Desc
        }
      }
    );

    equal(statement, `SELECT "id", "foo", "bar" FROM "ez4-test-select" ORDER BY "id" DESC`);

    deepEqual(variables, []);
  });

  it('assert :: prepare select (with relationship)', () => {
    const [statement, variables] = prepareSelectQuery<TestSchema, {}, TestIndexes, TestRelations, false>(
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
          id: '00000000-0000-1000-9000-000000000000'
        }
      }
    );

    equal(
      statement,
      `SELECT "R"."id", "R"."foo", "R"."bar", ` +
        // First relation
        `(SELECT json_build_object('id', "T"."id") ` +
        `FROM "ez4-test-relation" AS "T" WHERE "T"."id" = "R"."relation1_id") AS "relation1", ` +
        // Second relation
        `(SELECT json_build_object(` +
        `'id', "T"."id", ` +
        `'relation1_id', "T"."relation1_id", ` +
        `'relation2_id', "T"."relation2_id", ` +
        `'foo', "T"."foo", ` +
        `'bar', "T"."bar", ` +
        `'date', to_char("T"."date", 'YYYY-MM-DD'), ` +
        `'time', to_char("T"."time", 'HH24:MI:SS.MS"Z"'), ` +
        `'timestamp', to_char("T"."timestamp", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')) ` +
        `FROM "ez4-test-relation" AS "T" WHERE "T"."relation2_id" = "R"."id") AS "relation2", ` +
        // Third relation
        `(SELECT COALESCE(json_agg(json_build_object('foo', "T"."foo")), '[]'::json) ` +
        `FROM "ez4-test-relation" AS "T" WHERE "T"."relation1_id" = "R"."id") AS "relations" ` +
        //
        `FROM "ez4-test-select" AS "R" ` +
        `WHERE "R"."id" = :0`
    );

    deepEqual(variables, [makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID')]);
  });

  it('assert :: prepare select (with relationship filters)', () => {
    const [statement, variables] = prepareSelectQuery<TestSchema, {}, TestIndexes, TestRelations, false>(
      'ez4-test-select',
      testSchema,
      testRelations,
      {
        select: {
          id: true,
          foo: true,
          bar: true,
          relation1: {
            foo: true
          },
          relation2: {
            bar: true
          },
          relations: {
            foo: true,
            bar: true
          }
        },
        where: {
          id: '00000000-0000-1000-9000-000000000000',
          relation1: {
            foo: 123
          },
          relation2: {
            bar: {
              barBar: true
            }
          },
          relations: {
            id: '00000000-0000-1000-9000-000000000001'
          }
        }
      }
    );

    equal(
      statement,
      `SELECT "R"."id", "R"."foo", "R"."bar", ` +
        // First relation
        `(SELECT json_build_object('foo', "T"."foo") ` +
        `FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."id" = "R"."relation1_id") AS "relation1", ` +
        // Second relation
        `(SELECT json_build_object('bar', "T"."bar") ` +
        `FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."relation2_id" = "R"."id") AS "relation2", ` +
        // Third relation
        `(SELECT COALESCE(json_agg(json_build_object('foo', "T"."foo", 'bar', "T"."bar")), '[]'::json) ` +
        `FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."relation1_id" = "R"."id") AS "relations" ` +
        // Main condition
        `FROM "ez4-test-select" AS "R" ` +
        `WHERE "R"."id" = :0 AND ` +
        // First relation condition
        `EXISTS (SELECT 1 FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."foo" = :1 AND "T"."id" = "R"."relation1_id") AND ` +
        // Second relation condition
        `EXISTS (SELECT 1 FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."bar"['barBar'] = :2 AND "T"."relation2_id" = "R"."id") AND ` +
        // Third relation condition
        `EXISTS (SELECT 1 FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."id" = :3 AND "T"."relation1_id" = "R"."id")`
    );

    deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', 123),
      makeParameter('2', 'true', 'JSON'),
      makeParameter('3', '00000000-0000-1000-9000-000000000001', 'UUID')
    ]);
  });

  it('assert :: prepare select (with relationship connections)', () => {
    const [statement, variables] = prepareSelectQuery<TestSchema, {}, TestIndexes, TestRelations, false>(
      'ez4-test-select',
      testSchema,
      testRelations,
      {
        select: {
          id: true
        },
        where: {
          id: '00000000-0000-1000-9000-000000000000',
          relation1: {},
          relation2: null,
          NOT: {
            relations: null
          }
        }
      }
    );

    equal(
      statement,
      `SELECT "R"."id" ` +
        `FROM "ez4-test-select" AS "R" ` +
        `WHERE "R"."id" = :0 AND ` +
        // First relation
        `EXISTS (SELECT 1 FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."id" = "R"."relation1_id") AND ` +
        // Second relation
        `EXISTS (SELECT 1 FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."relation2_id" != "R"."id") AND ` +
        // Third relation
        `NOT EXISTS (SELECT 1 FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."relation1_id" != "R"."id")`
    );

    deepEqual(variables, [makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID')]);
  });

  it('assert :: prepare select (with relationship includes)', () => {
    const select = {
      id: true,
      relation1: {
        foo: true
      },
      relation2: {
        bar: {
          barBar: true
        }
      },
      relations: {
        bar: {
          barFoo: true
        }
      }
    };

    const [statement, variables] = prepareSelectQuery<TestSchema, typeof select, TestIndexes, TestRelations, false>(
      'ez4-test-select',
      testSchema,
      testRelations,
      {
        select,
        include: {
          relation1: {},
          relation2: null,
          relations: {
            foo: 123
          }
        },
        where: {
          id: '00000000-0000-1000-9000-000000000000'
        }
      }
    );

    equal(
      statement,
      `SELECT "R"."id", ` +
        // First relation
        `(SELECT json_build_object('foo', "T"."foo") ` +
        `FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."id" = "R"."relation1_id") AS "relation1", ` +
        // Second relation
        `(SELECT json_build_object('bar', json_build_object('barBar', "T"."bar"['barBar'])) ` +
        `FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."relation2_id" = "R"."id") AS "relation2", ` +
        // Third relation
        `(SELECT COALESCE(json_agg(json_build_object('bar', json_build_object('barFoo', "T"."bar"['barFoo']))), '[]'::json) ` +
        `FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."foo" = :0 AND "T"."relation1_id" = "R"."id") AS "relations" ` +
        //
        `FROM "ez4-test-select" AS "R" ` +
        `WHERE "R"."id" = :1`
    );

    deepEqual(variables, [makeParameter('0', 123), makeParameter('1', '00000000-0000-1000-9000-000000000000', 'UUID')]);
  });
});
