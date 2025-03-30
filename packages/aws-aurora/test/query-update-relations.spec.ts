import type { Query } from '@ez4/database';

import { describe, it } from 'node:test';

import { prepareUpdateQuery } from '@ez4/aws-aurora/client';
import { ObjectSchema, SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

import { makeParameter } from './common/parameters.js';

type TestSchema = {
  id: string;
  foo?: number;
  relation1_id?: string | null;
  relation2_id?: string | null;
  bar: {
    barFoo?: string;
    barBar?: boolean;
    barBaz?: {
      barBazFoo: number;
    };
  };
  baz?: {
    bazFoo: number;
  };
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
    relation1?: TestSchema | { relation1_id?: string };
    relation2?: TestSchema | { relation2_id?: string };
    relations?: TestSchema[];
  };
};

type TestIndexes = {
  id: Index.Primary;
  relation1_id: Index.Secondary;
  relation2_id: Index.Secondary;
};

describe.only('aurora query (update relations)', () => {
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
        nullable: true,
        format: 'uuid'
      },
      relation2_id: {
        type: SchemaType.String,
        optional: true,
        nullable: true,
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
          },
          barBaz: {
            type: SchemaType.Object,
            optional: true,
            properties: {
              barBazFoo: {
                type: SchemaType.Number
              }
            }
          }
        }
      },
      baz: {
        type: SchemaType.Object,
        optional: true,
        properties: {
          bazFoo: {
            type: SchemaType.Number
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

  const prepareUpdate = <S extends Query.SelectInput<TestSchema, TestRelations>>(
    query: Query.UpdateManyInput<TestSchema, S, TestRelations>
  ) => {
    return prepareUpdateQuery<TestSchema, S, TestIndexes, TestRelations>('ez4-test-update-relations', testSchema, testRelations, query);
  };

  it('assert :: prepare update relations (with select)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
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
        id: '00000000-0000-1000-9000-000000000000'
      }
    });

    assert.equal(
      statement,
      `UPDATE ONLY "ez4-test-update-relations" SET "foo" = :0, "bar"['barBar'] = :1 WHERE "id" = :2 ` +
        `RETURNING "foo", json_build_object('barBar', "bar"['barBar']) AS "bar"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', 123),
      makeParameter('1', 'false', 'JSON'),
      makeParameter('2', '00000000-0000-1000-9000-000000000000', 'UUID')
    ]);
  });

  it('assert :: prepare update relations (optional json)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      data: {
        bar: {
          barBaz: {
            barBazFoo: 123
          }
        },
        baz: {
          bazFoo: 456
        }
      },
      where: {
        id: '00000000-0000-1000-9000-000000000000'
      }
    });

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-relations" SET "bar"['barBaz'] = :0, "baz" = :1 WHERE "id" = :2`);

    assert.deepEqual(variables, [
      makeParameter('0', { barBazFoo: 123 }),
      makeParameter('1', { bazFoo: 456 }),
      makeParameter('2', '00000000-0000-1000-9000-000000000000', 'UUID')
    ]);
  });

  it('assert :: prepare update relations (primary foreign id connection)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        relation1: {
          relation1_id: '00000000-0000-1000-9000-000000000001'
        }
      },
      where: {
        foo: 123
      }
    });

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-relations" SET "id" = :0, "relation1_id" = :1 WHERE "foo" = :2`);

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', '00000000-0000-1000-9000-000000000001', 'UUID'),
      makeParameter('2', 123)
    ]);
  });

  it('assert :: prepare update relations (primary foreign id connection with select)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      select: {
        id: true,
        relation1: {
          id: true,
          foo: true
        }
      },
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        relation1: {
          relation1_id: '00000000-0000-1000-9000-000000000001'
        }
      },
      where: {
        foo: 123
      }
    });

    assert.equal(
      statement,
      `UPDATE ONLY "ez4-test-update-relations" AS "R" SET "id" = :0, "relation1_id" = :1 WHERE "R"."foo" = :2 RETURNING "R"."id", ` +
        `(SELECT json_build_object('id', "T"."id", 'foo', "T"."foo") FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."id" = "R"."relation1_id") AS "relation1"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', '00000000-0000-1000-9000-000000000001', 'UUID'),
      makeParameter('2', 123)
    ]);
  });

  it('assert :: prepare update relations (primary foreign id disconnection)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        relation1: {
          relation1_id: null
        }
      },
      where: {
        foo: 123
      }
    });

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-relations" SET "id" = :0, "relation1_id" = :1 WHERE "foo" = :2`);

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', null),
      makeParameter('2', 123)
    ]);
  });

  it('assert :: prepare update relations (primary foreign id empty)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        relation2: undefined,
        relation1: {
          relation1_id: undefined
        }
      },
      where: {
        foo: 123
      }
    });

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-relations" SET "id" = :0 WHERE "foo" = :1`);

    assert.deepEqual(variables, [makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'), makeParameter('1', 123)]);
  });

  it('assert :: prepare update relations (primary foreign creation)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        relation1: {
          foo: 123,
          bar: {
            barFoo: 'abc'
          }
        }
      },
      where: {
        foo: 456
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"R0" AS (UPDATE ONLY "ez4-test-update-relations" SET "id" = :0 WHERE "foo" = :1 RETURNING "relation1_id") ` +
        // Relation record
        `UPDATE ONLY "ez4-test-relation" AS "T" SET "foo" = :2, "bar"['barFoo'] = :3 FROM "R0" WHERE "T"."id" = "R0"."relation1_id"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', 456),
      makeParameter('2', 123),
      makeParameter('3', '"abc"', 'JSON')
    ]);
  });

  it('assert :: prepare update relations (primary foreign creation with select)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      select: {
        id: true,
        relation1: {
          id: true,
          foo: true
        }
      },
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        relation1: {
          foo: 123,
          bar: {
            barFoo: 'abc'
          }
        }
      },
      where: {
        foo: 456
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"R0" AS (UPDATE ONLY "ez4-test-update-relations" AS "R" SET "id" = :0 WHERE "R"."foo" = :1 RETURNING "R"."relation1_id"), ` +
        // Relation record
        `"R1" AS (UPDATE ONLY "ez4-test-relation" AS "T" SET "foo" = :2, "bar"['barFoo'] = :3 FROM "R0" WHERE "T"."id" = "R0"."relation1_id") ` +
        // Select
        `SELECT "id", (SELECT json_build_object('id', "T"."id", 'foo', "T"."foo") FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."id" = "R0"."relation1_id") AS "relation1" ` +
        `FROM "ez4-test-update-relations"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', 456),
      makeParameter('2', 123),
      makeParameter('3', '"abc"', 'JSON')
    ]);
  });

  it('assert :: prepare update relations (unique foreign id connection)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        relation2: {
          relation2_id: '00000000-0000-1000-9000-000000000001'
        }
      },
      where: {
        foo: 456
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"R0" AS (UPDATE ONLY "ez4-test-update-relations" SET "id" = :0 WHERE "foo" = :1 RETURNING "id") ` +
        // First relation
        `UPDATE ONLY "ez4-test-relation" AS "T" SET "relation2_id" = :2 FROM "R0" WHERE "T"."relation2_id" = "R0"."id"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', 456),
      makeParameter('2', '00000000-0000-1000-9000-000000000001', 'UUID')
    ]);
  });

  it('assert :: prepare update relations (unique foreign id disconnection)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        relation2: {
          relation2_id: null
        }
      },
      where: {
        foo: 456
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"R0" AS (UPDATE ONLY "ez4-test-update-relations" SET "id" = :0 WHERE "foo" = :1 RETURNING "id") ` +
        // First relation
        `UPDATE ONLY "ez4-test-relation" AS "T" SET "relation2_id" = :2 FROM "R0" WHERE "T"."relation2_id" = "R0"."id"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', 456),
      makeParameter('2', null)
    ]);
  });

  it('assert :: prepare update relations (unique foreign id empty)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        relation1: undefined,
        relation2: {
          relation2_id: undefined
        }
      },
      where: {
        foo: 123
      }
    });

    assert.equal(statement, `UPDATE ONLY "ez4-test-update-relations" SET "id" = :0 WHERE "foo" = :1`);

    assert.deepEqual(variables, [makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'), makeParameter('1', 123)]);
  });

  it('assert :: prepare update relations (unique foreign creation)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        relation2: {
          foo: 456,
          bar: {
            barBar: false
          }
        }
      },
      where: {
        foo: 123
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"R0" AS (UPDATE ONLY "ez4-test-update-relations" SET "id" = :0 WHERE "foo" = :1 RETURNING "id") ` +
        // First relation
        `UPDATE ONLY "ez4-test-relation" AS "T" SET "foo" = :2, "bar"['barBar'] = :3 FROM "R0" WHERE "T"."relation2_id" = "R0"."id"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', 123),
      makeParameter('2', 456),
      makeParameter('3', 'false', 'JSON')
    ]);
  });

  it('assert :: prepare update relations (unique foreign creation with select)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      select: {
        id: true,
        relation2: {
          id: true,
          foo: true
        }
      },
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        relation2: {
          foo: 456,
          bar: {
            barBar: false
          }
        }
      },
      where: {
        foo: 123
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"R0" AS (UPDATE ONLY "ez4-test-update-relations" AS "R" SET "id" = :0 WHERE "R"."foo" = :1 RETURNING "R"."id"), ` +
        // First relation
        `"R1" AS (UPDATE ONLY "ez4-test-relation" AS "T" SET "foo" = :2, "bar"['barBar'] = :3 FROM "R0" WHERE "T"."relation2_id" = "R0"."id") ` +
        // Select
        `SELECT "id", (SELECT json_build_object('id', "T"."id", 'foo', "T"."foo") FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."relation2_id" = "R0"."id") AS "relation2" ` +
        `FROM "ez4-test-update-relations"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', 123),
      makeParameter('2', 456),
      makeParameter('3', 'false', 'JSON')
    ]);
  });

  it('assert :: prepare update relations (inverse array object)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        relations: {
          foo: 123
        }
      },
      where: {
        foo: 456
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"R0" AS (UPDATE ONLY "ez4-test-update-relations" SET "id" = :0 WHERE "foo" = :1 RETURNING "id") ` +
        // First relation
        `UPDATE ONLY "ez4-test-relation" AS "T" SET "foo" = :2 FROM "R0" WHERE "T"."relation1_id" = "R0"."id"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', 456),
      makeParameter('2', 123)
    ]);
  });

  it('assert :: prepare update relations (inverse array object with select)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      select: {
        id: true,
        relations: {
          id: true,
          bar: true
        }
      },
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        relations: {
          foo: 123
        }
      },
      where: {
        foo: 456
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"R0" AS (UPDATE ONLY "ez4-test-update-relations" AS "R" SET "id" = :0 WHERE "R"."foo" = :1 RETURNING "R"."id"), ` +
        // First relation
        `"R1" AS (UPDATE ONLY "ez4-test-relation" AS "T" SET "foo" = :2 FROM "R0" WHERE "T"."relation1_id" = "R0"."id") ` +
        // Select
        `SELECT "id", (SELECT COALESCE(json_agg(json_build_object('id', "T"."id", 'bar', "T"."bar")), '[]'::json) FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."relation1_id" = "R0"."id") AS "relations" ` +
        `FROM "ez4-test-update-relations"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', 456),
      makeParameter('2', 123)
    ]);
  });

  it('assert :: prepare update relations (foreign and inverse)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        relation1: {
          bar: {
            barFoo: 'abc'
          }
        },
        relation2: {
          bar: {
            barBar: true
          }
        },
        relations: {
          foo: 123
        }
      },
      where: {
        foo: 456
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"R0" AS (UPDATE ONLY "ez4-test-update-relations" SET "id" = :0 WHERE "foo" = :1 RETURNING "relation1_id", "id"), ` +
        // First relation (primary)
        `"R1" AS (UPDATE ONLY "ez4-test-relation" AS "T" SET "bar"['barFoo'] = :2 FROM "R0" WHERE "T"."id" = "R0"."relation1_id"), ` +
        // Second relation (unique)
        `"R2" AS (UPDATE ONLY "ez4-test-relation" AS "T" SET "bar"['barBar'] = :3 FROM "R0" WHERE "T"."relation2_id" = "R0"."id") ` +
        // Third relation (inverse)
        `UPDATE ONLY "ez4-test-relation" AS "T" SET "foo" = :4 FROM "R0" WHERE "T"."relation1_id" = "R0"."id"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', 456),
      makeParameter('2', '"abc"', 'JSON'),
      makeParameter('3', 'true', 'JSON'),
      makeParameter('4', 123)
    ]);
  });

  it('assert :: prepare update relations (foreign and inverse with select)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
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
        relation1: {
          bar: {
            barFoo: 'abc'
          }
        },
        relation2: {
          bar: {
            barBar: true
          }
        },
        relations: {
          foo: 123
        }
      },
      where: {
        foo: 456
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"R0" AS (UPDATE ONLY "ez4-test-update-relations" AS "R" SET "id" = :0 WHERE "R"."foo" = :1 RETURNING "R"."relation1_id", "R"."id"), ` +
        // First relation (primary)
        `"R1" AS (UPDATE ONLY "ez4-test-relation" AS "T" SET "bar"['barFoo'] = :2 FROM "R0" WHERE "T"."id" = "R0"."relation1_id"), ` +
        // Second relation (unique)
        `"R2" AS (UPDATE ONLY "ez4-test-relation" AS "T" SET "bar"['barBar'] = :3 FROM "R0" WHERE "T"."relation2_id" = "R0"."id"), ` +
        // Third relation (inverse)
        `"R3" AS (UPDATE ONLY "ez4-test-relation" AS "T" SET "foo" = :4 FROM "R0" WHERE "T"."relation1_id" = "R0"."id") ` +
        // Select
        `SELECT "id", ` +
        `(SELECT json_build_object('foo', "T"."foo") FROM "ez4-test-relation" AS "T" WHERE "T"."id" = "R0"."relation1_id") AS "relation1", ` +
        `(SELECT json_build_object('id', "T"."id") FROM "ez4-test-relation" AS "T" WHERE "T"."relation2_id" = "R0"."id") AS "relation2", ` +
        `(SELECT COALESCE(json_agg(json_build_object('foo', "T"."foo")), '[]'::json) FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."relation1_id" = "R0"."id") AS "relations" ` +
        `FROM "ez4-test-update-relations"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', 456),
      makeParameter('2', '"abc"', 'JSON'),
      makeParameter('3', 'true', 'JSON'),
      makeParameter('4', 123)
    ]);
  });

  it('assert :: prepare update relations (only relationships)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      data: {
        relation1: {
          bar: {
            barFoo: 'abc'
          }
        },
        relation2: {
          bar: {
            barBar: false
          }
        },
        relations: {
          foo: 123
        }
      },
      where: {
        foo: 456
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main record
        `"R0" AS (SELECT "relation1_id", "id" FROM "ez4-test-update-relations" WHERE "foo" = :0), ` +
        // First relation (primary)
        `"R1" AS (UPDATE ONLY "ez4-test-relation" AS "T" SET "bar"['barFoo'] = :1 FROM "R0" WHERE "T"."id" = "R0"."relation1_id"), ` +
        // Second relation (unique)
        `"R2" AS (UPDATE ONLY "ez4-test-relation" AS "T" SET "bar"['barBar'] = :2 FROM "R0" WHERE "T"."relation2_id" = "R0"."id") ` +
        // Third relation (inverse)
        `UPDATE ONLY "ez4-test-relation" AS "T" SET "foo" = :3 FROM "R0" WHERE "T"."relation1_id" = "R0"."id"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', 456),
      makeParameter('1', '"abc"', 'JSON'),
      makeParameter('2', 'false', 'JSON'),
      makeParameter('3', 123)
    ]);
  });

  it('assert :: prepare update relations (optional json relationships)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      data: {
        relation1: {
          bar: {
            barBaz: {
              barBazFoo: 123
            }
          },
          baz: {
            bazFoo: 456
          }
        }
      },
      where: {
        id: '00000000-0000-1000-9000-000000000000'
      }
    });

    assert.equal(
      statement,
      `WITH ` +
        // Main select
        `"R0" AS (SELECT "relation1_id" FROM "ez4-test-update-relations" WHERE "id" = :0) ` +
        // Update relation
        `UPDATE ONLY "ez4-test-relation" AS "T" SET "bar"['barBaz'] = :1, "baz" = :2 FROM "R0" WHERE "T"."id" = "R0"."relation1_id"`
    );

    assert.deepEqual(variables, [
      makeParameter('0', '00000000-0000-1000-9000-000000000000', 'UUID'),
      makeParameter('1', { barBazFoo: 123 }),
      makeParameter('2', { bazFoo: 456 })
    ]);
  });
});
