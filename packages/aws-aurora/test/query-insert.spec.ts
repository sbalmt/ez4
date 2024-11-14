import { equal, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { prepareInsertQuery } from '@ez4/aws-aurora/client';

import { ObjectSchema, SchemaTypeName } from '@ez4/schema';
import { Index } from '@ez4/database';

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
  relation1?: TestSchema;
  relation2?: TestSchema;
  relations?: TestSchema[];
};

type TestIndexes = {
  id: Index.Primary;
};

describe.only('aurora query insert', () => {
  const testSchema: ObjectSchema = {
    type: SchemaTypeName.Object,
    properties: {
      id: {
        type: SchemaTypeName.String,
        format: 'uuid'
      },
      relation1_id: {
        type: SchemaTypeName.String,
        format: 'uuid'
      },
      relation2_id: {
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

  it.only('assert :: prepare insert (with foreign relationship)', () => {
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

  it.only('assert :: prepare insert (with inverse relationship)', () => {
    const [statement, variables] = prepareInsertQuery<TestSchema, TestIndexes, TestRelations>(
      'ez4-test-insert',
      testSchema,
      testRelations,
      {
        data: {
          id: 'abc',
          bar: {},
          relations: [
            {
              id: 'def',
              bar: {
                barBar: true
              }
            },
            {
              id: 'ghi',
              bar: {
                barFoo: 'test'
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
        `SELECT :2i, :3i, "id" FROM R1 RETURNING R1.*) ` +
        // Second relation
        `INSERT INTO "ez4-test-relation" ("id", "bar", "relation2_id") ` +
        `SELECT :4i, :5i, "id" FROM R2 RETURNING R2.*`
    );

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
        typeHint: 'JSON',
        value: {
          stringValue: '{}'
        }
      },
      {
        name: '2i',
        typeHint: 'UUID',
        value: {
          stringValue: 'def'
        }
      },
      {
        name: '3i',
        typeHint: 'JSON',
        value: {
          stringValue: JSON.stringify({
            barBar: true
          })
        }
      },
      {
        name: '4i',
        typeHint: 'UUID',
        value: {
          stringValue: 'ghi'
        }
      },
      {
        name: '5i',
        typeHint: 'JSON',
        value: {
          stringValue: JSON.stringify({
            barFoo: 'test'
          })
        }
      }
    ]);
  });

  it.only('assert :: prepare insert (with both relationship)', () => {
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
          relations: [
            {
              id: 'ghi',
              bar: {
                barFoo: 'test'
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
        `SELECT :4i, :5i, "id" FROM R2 RETURNING R2.*`
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
          stringValue: 'abc'
        }
      },
      {
        name: '3i',
        typeHint: 'JSON',
        value: {
          stringValue: '{}'
        }
      },
      {
        name: '4i',
        typeHint: 'UUID',
        value: {
          stringValue: 'ghi'
        }
      },
      {
        name: '5i',
        typeHint: 'JSON',
        value: {
          stringValue: JSON.stringify({
            barFoo: 'test'
          })
        }
      }
    ]);
  });
});
