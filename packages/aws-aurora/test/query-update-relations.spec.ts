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
    primary_to_secondary: TestSchema;
    unique_to_primary: TestSchema;
    secondary_to_primary: TestSchema;
  };
  selects: {
    primary_to_secondary?: TestSchema;
    unique_to_primary?: TestSchema;
    secondary_to_primary?: TestSchema[];
  };
  changes: {
    primary_to_secondary?: TestSchema | { relation1_id?: string };
    unique_to_primary?: TestSchema | { relation2_id?: string };
    secondary_to_primary?: TestSchema[];
  };
};

describe('aurora query (update relations)', () => {
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
    primary_to_secondary: {
      sourceSchema: testSchema,
      sourceTable: 'ez4-test-relation',
      sourceAlias: 'ez4-test-relation',
      targetAlias: 'primary_to_secondary',
      targetColumn: 'relation1_id',
      sourceColumn: 'id',
      sourceIndex: Index.Primary,
      targetIndex: Index.Secondary
    },
    unique_to_primary: {
      sourceSchema: testSchema,
      sourceTable: 'ez4-test-relation',
      sourceAlias: 'ez4-test-relation',
      targetAlias: 'unique_to_primary',
      targetColumn: 'id',
      sourceColumn: 'relation2_id',
      sourceIndex: Index.Unique,
      targetIndex: Index.Primary
    },
    secondary_to_primary: {
      sourceSchema: testSchema,
      sourceTable: 'ez4-test-relation',
      sourceAlias: 'ez4-test-relation',
      targetAlias: 'secondary_to_primary',
      targetColumn: 'id',
      sourceColumn: 'relation1_id',
      sourceIndex: Index.Secondary,
      targetIndex: Index.Primary
    }
  };

  const prepareUpdate = <S extends Query.SelectInput<TestSchema, TestRelations>>(
    query: Query.UpdateManyInput<TestSchema, S, TestRelations>
  ) => {
    return prepareUpdateQuery<TestSchema, S, {}, TestRelations>('ez4-test-update-relations', testSchema, testRelations, query);
  };

  it('assert :: prepare update relations (primary foreign id connection)', async ({ assert }) => {
    const [statement, variables] = await prepareUpdate({
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        primary_to_secondary: {
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
        primary_to_secondary: {
          id: true,
          foo: true
        }
      },
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        primary_to_secondary: {
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
        `WHERE "T"."id" = "R"."relation1_id") AS "primary_to_secondary"`
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
        primary_to_secondary: {
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
        unique_to_primary: undefined,
        primary_to_secondary: {
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
        primary_to_secondary: {
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
        primary_to_secondary: {
          id: true,
          foo: true
        }
      },
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        primary_to_secondary: {
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
        `WHERE "T"."id" = "R0"."relation1_id") AS "primary_to_secondary" ` +
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
        unique_to_primary: {
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
        unique_to_primary: {
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
        primary_to_secondary: undefined,
        unique_to_primary: {
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
        unique_to_primary: {
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
        unique_to_primary: {
          id: true,
          foo: true
        }
      },
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        unique_to_primary: {
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
        `WHERE "T"."relation2_id" = "R0"."id") AS "unique_to_primary" ` +
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
        secondary_to_primary: {
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
        secondary_to_primary: {
          id: true,
          bar: true
        }
      },
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        secondary_to_primary: {
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
        `WHERE "T"."relation1_id" = "R0"."id") AS "secondary_to_primary" ` +
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
        primary_to_secondary: {
          bar: {
            barFoo: 'abc'
          }
        },
        unique_to_primary: {
          bar: {
            barBar: true
          }
        },
        secondary_to_primary: {
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
        primary_to_secondary: {
          foo: true
        },
        unique_to_primary: {
          id: true
        },
        secondary_to_primary: {
          foo: true
        }
      },
      data: {
        id: '00000000-0000-1000-9000-000000000000',
        primary_to_secondary: {
          bar: {
            barFoo: 'abc'
          }
        },
        unique_to_primary: {
          bar: {
            barBar: true
          }
        },
        secondary_to_primary: {
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
        `(SELECT json_build_object('foo', "T"."foo") FROM "ez4-test-relation" AS "T" WHERE "T"."id" = "R0"."relation1_id") AS "primary_to_secondary", ` +
        `(SELECT json_build_object('id', "T"."id") FROM "ez4-test-relation" AS "T" WHERE "T"."relation2_id" = "R0"."id") AS "unique_to_primary", ` +
        `(SELECT COALESCE(json_agg(json_build_object('foo', "T"."foo")), '[]'::json) FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."relation1_id" = "R0"."id") AS "secondary_to_primary" ` +
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
        primary_to_secondary: {
          bar: {
            barFoo: 'abc'
          }
        },
        unique_to_primary: {
          bar: {
            barBar: false
          }
        },
        secondary_to_primary: {
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
        primary_to_secondary: {
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
