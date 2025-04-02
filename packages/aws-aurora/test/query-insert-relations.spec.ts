import type { Query } from '@ez4/database';

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
  filters: {
    relation1: TestSchema;
    relation2: TestSchema;
    relation3: TestSchema;
    relations: TestSchema;
  };
  selects: {
    relation1?: TestSchema;
    relation2?: TestSchema;
    relation3?: TestSchema;
    relations?: TestSchema[];
  };
  changes: {
    relation1?: TestSchema | { relation1_id?: string };
    relation2?: TestSchema | { relation2_id?: string };
    relation3?: TestSchema | { relation3_id: string };
    relations?: TestSchema[];
  };
};

describe('aurora query (insert relations)', () => {
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

  const prepareInsert = <S extends Query.SelectInput<TestSchema, TestRelations>>(
    query: Query.InsertOneInput<TestSchema, S, TestRelations>
  ) => {
    return prepareInsertQuery<TestSchema, S, TestRelations>('ez4-test-insert-relations', testSchema, testRelations, query);
  };

  it('assert :: prepare insert (with select)', async ({ assert }) => {
    const [statement, variables] = await prepareInsert({
      select: {
        foo: true,
        bar: {
          barBar: true
        }
      },
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        foo: 123,
        bar: {
          barFoo: 'abc',
          barBar: true
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"R0" AS (INSERT INTO "ez4-test-insert-relations" ("id", "foo", "bar") ` +
        `VALUES (:0, :1, :2) RETURNING "foo", "bar") ` +
        // Select
        `SELECT "foo", json_build_object('barBar', "bar"['barBar']) AS "bar" ` +
        `FROM "R0"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', 123),
      makeParameter('2', { barFoo: 'abc', barBar: true })
    ]);
  });

  it('assert :: prepare insert relations (primary foreign id connection)', async ({ assert }) => {
    const [statement, variables] = await prepareInsert({
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        bar: {},
        relation1: {
          relation1_id: '00000000-0000-1000-9000-000000000001'
        }
      }
    });

    assert.equal(
      statement,
      // Main record
      `INSERT INTO "ez4-test-insert-relations" ("id", "bar", "relation1_id") VALUES (:0, :1, :2)`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', {}),
      makeParameter('2', '00000000-0000-1000-9000-000000000001', 'UUID')
    ]);
  });

  it('assert :: prepare insert relations (primary foreign id connection with select)', async ({ assert }) => {
    const [statement, variables] = await prepareInsert({
      select: {
        id: true,
        relation1: {
          id: true,
          foo: true
        }
      },
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        bar: {},
        relation1: {
          relation1_id: '00000000-0000-1000-9000-000000000001'
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"R0" AS (INSERT INTO "ez4-test-insert-relations" ("id", "bar", "relation1_id") ` +
        `VALUES (:0, :1, :2) RETURNING "id") ` +
        // Select
        `SELECT "id", ` +
        `(SELECT json_build_object('id', "T"."id", 'foo', "T"."foo") ` +
        `FROM "ez4-test-relation" AS "T" WHERE "T"."relation1_id" = "R0"."id"` +
        `) AS "relation1" ` +
        `FROM "R0"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', {}),
      makeParameter('2', '00000000-0000-1000-9000-000000000001', 'UUID')
    ]);
  });

  it('assert :: prepare insert relations (primary foreign id empty)', async ({ assert }) => {
    const [statement, variables] = await prepareInsert({
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        bar: {},
        relation2: undefined,
        relation1: {
          relation1_id: undefined
        }
      }
    });

    assert.equal(
      statement,
      // Main record
      `INSERT INTO "ez4-test-insert-relations" ("id", "bar") VALUES (:0, :1)`
    );

    assert.deepEqual(variables, [makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'), makeParameter('1', {})]);
  });

  it('assert :: prepare insert relations (primary foreign creation)', async ({ assert }) => {
    const [statement, variables] = await prepareInsert({
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
    });

    assert.equal(
      statement,
      `WITH ` +
        // First relation
        `"R0" AS (INSERT INTO "ez4-test-relation" ("id", "bar") ` +
        `VALUES (:0, :1) RETURNING "id"), ` +
        // Second relation
        `"R1" AS (INSERT INTO "ez4-test-relation" ("id", "bar") ` +
        `VALUES (:2, :3) RETURNING "id") ` +
        // Main record
        `INSERT INTO "ez4-test-insert-relations" ("id", "bar", "relation1_id", "relation3_id") ` +
        `SELECT :4, :5, "R0"."id", "R1"."id" FROM "R0", "R1"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000001', 'UUID'),
      makeParameter('1', { barBar: true }),
      makeParameter('2', '00000000-0000-1000-9000-000000000002', 'UUID'),
      makeParameter('3', { barFoo: 'abc' }),
      makeParameter('4', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('5', {})
    ]);
  });

  it('assert :: prepare insert relations (primary foreign creation with select)', async ({ assert }) => {
    const [statement, variables] = await prepareInsert({
      select: {
        id: true,
        relation1: {
          id: true
        },
        relation3: {
          foo: true
        }
      },
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
    });

    assert.equal(
      statement,
      `WITH ` +
        // First relation
        `"R0" AS (INSERT INTO "ez4-test-relation" ("id", "bar") ` +
        `VALUES (:0, :1) RETURNING "id"), ` +
        // Second relation
        `"R1" AS (INSERT INTO "ez4-test-relation" ("id", "bar") ` +
        `VALUES (:2, :3) RETURNING "id", "foo"), ` +
        // Main record
        `"R2" AS (INSERT INTO "ez4-test-insert-relations" ("id", "bar", "relation1_id", "relation3_id") ` +
        `SELECT :4, :5, "R0"."id", "R1"."id" FROM "R0", "R1" RETURNING "id") ` +
        // Select
        `SELECT "id", ` +
        `(SELECT json_build_object('id', "id") FROM "R0") AS "relation1", ` +
        `(SELECT json_build_object('foo', "foo") FROM "R1") AS "relation3" ` +
        `FROM "R2"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000001', 'UUID'),
      makeParameter('1', { barBar: true }),
      makeParameter('2', '00000000-0000-1000-9000-000000000002', 'UUID'),
      makeParameter('3', { barFoo: 'abc' }),
      makeParameter('4', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('5', {})
    ]);
  });

  it('assert :: prepare insert relations (unique foreign id connection)', async ({ assert }) => {
    const [statement, variables] = await prepareInsert({
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        bar: {},
        relation2: {
          relation2_id: '00000000-0000-1000-9000-000000000001'
        }
      }
    });

    assert.equal(
      statement,
      // Main record
      `INSERT INTO "ez4-test-insert-relations" ("id", "bar", "relation2_id") VALUES (:0, :1, :2)`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', {}),
      makeParameter('2', '00000000-0000-1000-9000-000000000001', 'UUID')
    ]);
  });

  it('assert :: prepare insert relations (unique foreign id connection with select)', async ({ assert }) => {
    const [statement, variables] = await prepareInsert({
      select: {
        id: true,
        relation2: {
          id: true,
          foo: true
        }
      },
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        bar: {},
        relation2: {
          relation2_id: '00000000-0000-1000-9000-000000000001'
        }
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"R0" AS (INSERT INTO "ez4-test-insert-relations" ("id", "bar", "relation2_id") ` +
        `VALUES (:0, :1, :2) RETURNING "id") ` +
        // Select
        `SELECT "id", ` +
        `(SELECT json_build_object('id', "T"."id", 'foo', "T"."foo") ` +
        `FROM "ez4-test-relation" AS "T" WHERE "T"."relation2_id" = "R0"."id"` +
        `) AS "relation2" ` +
        `FROM "R0"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', {}),
      makeParameter('2', '00000000-0000-1000-9000-000000000001', 'UUID')
    ]);
  });

  it('assert :: prepare update relations (unique foreign id empty)', async ({ assert }) => {
    const [statement, variables] = await prepareInsert({
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        bar: {},
        relation1: undefined,
        relation2: {
          relation2_id: undefined
        }
      }
    });

    assert.equal(
      statement,
      // Main record
      `INSERT INTO "ez4-test-insert-relations" ("id", "bar") VALUES (:0, :1)`
    );

    assert.deepEqual(variables, [makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'), makeParameter('1', {})]);
  });

  it('assert :: prepare insert relations (unique foreign creation)', async ({ assert }) => {
    const [statement, variables] = await prepareInsert({
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
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"R0" AS (INSERT INTO "ez4-test-insert-relations" ("id", "bar") ` +
        `VALUES (:0, :1) RETURNING "id") ` +
        // First relation
        `INSERT INTO "ez4-test-relation" ("id", "bar", "relation2_id") ` +
        `SELECT :2, :3, "R0"."id" FROM "R0"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', {}),
      makeParameter('2', '00000000-0000-1000-9000-000000000001', 'UUID'),
      makeParameter('3', { barBar: true })
    ]);
  });

  it('assert :: prepare insert relations (unique foreign creation with select)', async ({ assert }) => {
    const [statement, variables] = await prepareInsert({
      select: {
        id: true,
        relation2: {
          id: true,
          foo: true
        }
      },
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
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"R0" AS (INSERT INTO "ez4-test-insert-relations" ("id", "bar") ` +
        `VALUES (:0, :1) RETURNING "id"), ` +
        // First relation
        `"R1" AS (INSERT INTO "ez4-test-relation" ("id", "bar", "relation2_id") ` +
        `SELECT :2, :3, "R0"."id" FROM "R0" RETURNING "id", "foo") ` +
        // Select
        `SELECT "id", ` +
        `(SELECT json_build_object('id', "id", 'foo', "foo") FROM "R1") AS "relation2" ` +
        `FROM "R0"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', {}),
      makeParameter('2', '00000000-0000-1000-9000-000000000001', 'UUID'),
      makeParameter('3', { barBar: true })
    ]);
  });

  it('assert :: prepare insert relations (inverse array object)', async ({ assert }) => {
    const [statement, variables] = await prepareInsert({
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
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"R0" AS (INSERT INTO "ez4-test-insert-relations" ("id", "bar") ` +
        `VALUES (:0, :1) RETURNING "id"), ` +
        // First relation
        `"R1" AS (INSERT INTO "ez4-test-relation" ("id", "bar", "relation1_id") ` +
        `SELECT :2, :3, "R0"."id" FROM "R0") ` +
        // Second relation
        `INSERT INTO "ez4-test-relation" ("id", "bar", "relation1_id") ` +
        `SELECT :4, :5, "R0"."id" FROM "R0"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', {}),
      makeParameter('2', '00000000-0000-1000-9000-000000000001', 'UUID'),
      makeParameter('3', { barBar: true }),
      makeParameter('4', '00000000-0000-1000-9000-000000000002', 'UUID'),
      makeParameter('5', { barFoo: 'abc' })
    ]);
  });

  it('assert :: prepare insert relations (inverse array object with select)', async ({ assert }) => {
    const [statement, variables] = await prepareInsert({
      select: {
        id: true,
        relations: {
          id: true,
          bar: {
            barFoo: true
          }
        }
      },
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
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"R0" AS (INSERT INTO "ez4-test-insert-relations" ("id", "bar") ` +
        `VALUES (:0, :1) RETURNING "id"), ` +
        // First relation
        `"R1" AS (INSERT INTO "ez4-test-relation" ("id", "bar", "relation1_id") ` +
        `SELECT :2, :3, "R0"."id" FROM "R0" RETURNING "id", "bar"), ` +
        // Second relation
        `"R2" AS (INSERT INTO "ez4-test-relation" ("id", "bar", "relation1_id") ` +
        `SELECT :4, :5, "R0"."id" FROM "R0" RETURNING "id", "bar") ` +
        // Select
        `SELECT "id", ` +
        `(SELECT COALESCE(json_agg(json_build_object('id', "id", 'bar', json_build_object('barFoo', "bar"['barFoo']))), '[]'::json) ` +
        `FROM "R1", "R2"` +
        `) AS "relations" ` +
        `FROM "R0"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', {}),
      makeParameter('2', '00000000-0000-1000-9000-000000000001', 'UUID'),
      makeParameter('3', { barBar: true }),
      makeParameter('4', '00000000-0000-1000-9000-000000000002', 'UUID'),
      makeParameter('5', { barFoo: 'abc' })
    ]);
  });

  it('assert :: prepare insert relations (foreign and inverse)', async ({ assert }) => {
    const [statement, variables] = await prepareInsert({
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
    });

    assert.equal(
      statement,
      `WITH ` +
        // First relation (primary)
        `"R0" AS (INSERT INTO "ez4-test-relation" ("id", "bar") ` +
        `VALUES (:0, :1) RETURNING "id"), ` +
        // Main record
        `"R1" AS (INSERT INTO "ez4-test-insert-relations" ("id", "bar", "relation1_id") ` +
        `SELECT :2, :3, "R0"."id" FROM "R0" RETURNING "id"), ` +
        // Second relation (unique)
        `"R2" AS (INSERT INTO "ez4-test-relation" ("id", "bar", "relation2_id") ` +
        `SELECT :4, :5, "R1"."id" FROM "R1") ` +
        // Third relation (inverse)
        `INSERT INTO "ez4-test-relation" ("id", "bar", "relation1_id") ` +
        `SELECT :6, :7, "R1"."id" FROM "R1"`
    );

    assert.deepEqual(variables, [
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

  it('assert :: prepare insert relations (foreign and inverse with select)', async ({ assert }) => {
    const [statement, variables] = await prepareInsert({
      select: {
        id: true,
        relation1: {
          foo: true
        },
        relation2: {
          id: true
        },
        relations: {
          foo: true
        }
      },
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
    });

    assert.equal(
      statement,
      `WITH ` +
        // First relation (primary)
        `"R0" AS (INSERT INTO "ez4-test-relation" ("id", "bar") ` +
        `VALUES (:0, :1) RETURNING "id", "foo"), ` +
        // Main record
        `"R1" AS (INSERT INTO "ez4-test-insert-relations" ("id", "bar", "relation1_id") ` +
        `SELECT :2, :3, "R0"."id" FROM "R0" RETURNING "id"), ` +
        // Second relation (unique)
        `"R2" AS (INSERT INTO "ez4-test-relation" ("id", "bar", "relation2_id") ` +
        `SELECT :4, :5, "R1"."id" FROM "R1" RETURNING "id"), ` +
        // Third relation (inverse)
        `"R3" AS (INSERT INTO "ez4-test-relation" ("id", "bar", "relation1_id") ` +
        `SELECT :6, :7, "R1"."id" FROM "R1" RETURNING "foo") ` +
        // Select
        `SELECT "id", ` +
        `(SELECT json_build_object('foo', "foo") FROM "R0") AS "relation1", ` +
        `(SELECT json_build_object('id', "id") FROM "R2") AS "relation2", ` +
        `(SELECT COALESCE(json_agg(json_build_object('foo', "foo")), '[]'::json) FROM "R3") AS "relations" ` +
        `FROM "R1"`
    );

    assert.deepEqual(variables, [
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
