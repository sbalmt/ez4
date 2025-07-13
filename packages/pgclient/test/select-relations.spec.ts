import type { PostgresEngine, RepositoryRelationsWithSchema } from '@ez4/pgclient/library';
import type { Query } from '@ez4/database';

import { describe, it } from 'node:test';

import { prepareSelectQuery } from '@ez4/pgclient/library';
import { ObjectSchema, SchemaType } from '@ez4/schema';
import { Index, Order } from '@ez4/database';
import { SqlBuilder } from '@ez4/pgsql';

type TestTableSchema = {
  id: string;
  foo?: number;
  relation1_id?: string;
  relation2_id?: string;
};

type TestTableMetadata = {
  engine: PostgresEngine;
  schema: TestTableSchema;
  relations: {
    indexes: 'relation1_id' | 'relation2_id';
    filters: {
      primary_to_secondary: TestTableSchema;
      unique_to_primary: TestTableSchema;
      secondary_to_primary: TestTableSchema;
    };
    selects: {
      primary_to_secondary?: TestTableSchema;
      unique_to_primary?: TestTableSchema;
      secondary_to_primary?: TestTableSchema[];
    };
    changes: {
      primary_to_secondary?: TestTableSchema | { relation1_id: string };
      unique_to_primary?: TestTableSchema | { relation2_id: string };
      secondary_to_primary?: TestTableSchema[];
    };
  };
  indexes: {
    id: Index.Primary;
    relation1_id: Index.Secondary;
    relation2_id: Index.Secondary;
  };
};

describe('select relations', () => {
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
      }
    }
  };

  const testRelations: RepositoryRelationsWithSchema = {
    primary_to_secondary: {
      sourceSchema: testSchema,
      sourceTable: 'ez4-test-relation',
      sourceAlias: 'ez4-test-relation',
      targetColumn: 'relation1_id',
      sourceColumn: 'id',
      sourceIndex: Index.Primary,
      targetIndex: Index.Secondary
    },
    unique_to_primary: {
      sourceSchema: testSchema,
      sourceTable: 'ez4-test-relation',
      sourceAlias: 'ez4-test-relation',
      targetColumn: 'id',
      sourceColumn: 'relation2_id',
      sourceIndex: Index.Unique,
      targetIndex: Index.Primary
    },
    secondary_to_primary: {
      sourceSchema: testSchema,
      sourceTable: 'ez4-test-relation',
      sourceAlias: 'ez4-test-relation',
      targetColumn: 'id',
      sourceColumn: 'relation1_id',
      sourceIndex: Index.Secondary,
      targetIndex: Index.Primary
    }
  };

  const prepareSelect = <S extends Query.SelectInput<TestTableMetadata>>(query: Query.FindOneInput<S, TestTableMetadata>) => {
    const builder = new SqlBuilder();

    return prepareSelectQuery('ez4-test-select-relations', testSchema, testRelations, query, builder);
  };

  it('assert :: prepare select relations', ({ assert }) => {
    const [statement, variables] = prepareSelect({
      select: {
        id: true,
        foo: true,
        primary_to_secondary: {
          id: true
        },
        unique_to_primary: true,
        secondary_to_primary: {
          foo: true
        }
      },
      where: {
        id: '00000000-0000-1000-9000-000000000000'
      }
    });

    assert.equal(
      statement,
      `SELECT "R"."id", "R"."foo", ` +
        // First relation
        `(SELECT json_build_object('id', "T"."id") ` +
        `FROM "ez4-test-relation" AS "T" WHERE "T"."id" = "R"."relation1_id") AS "primary_to_secondary", ` +
        // Second relation
        `(SELECT json_build_object(` +
        `'id', "T"."id", ` +
        `'relation1_id', "T"."relation1_id", ` +
        `'relation2_id', "T"."relation2_id", ` +
        `'foo', "T"."foo") ` +
        `FROM "ez4-test-relation" AS "T" WHERE "T"."relation2_id" = "R"."id") AS "unique_to_primary", ` +
        // Third relation
        `(SELECT COALESCE(json_agg(json_build_object('foo', "T"."foo")), '[]'::json) ` +
        `FROM "ez4-test-relation" AS "T" WHERE "T"."relation1_id" = "R"."id") AS "secondary_to_primary" ` +
        //
        `FROM "ez4-test-select-relations" AS "R" ` +
        `WHERE "R"."id" = :0`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000']);
  });

  it('assert :: prepare select relations (with filters)', ({ assert }) => {
    const [statement, variables] = prepareSelect({
      select: {
        id: true,
        foo: true,
        primary_to_secondary: {
          foo: true
        },
        unique_to_primary: {
          foo: true
        },
        secondary_to_primary: {
          foo: true
        }
      },
      where: {
        id: '00000000-0000-1000-9000-000000000000',
        primary_to_secondary: {
          foo: 123
        },
        unique_to_primary: {
          foo: 456
        },
        secondary_to_primary: {
          id: '00000000-0000-1000-9000-000000000001'
        }
      }
    });

    assert.equal(
      statement,
      `SELECT "R"."id", "R"."foo", ` +
        // First relation
        `(SELECT json_build_object('foo', "T"."foo") FROM "ez4-test-relation" AS "T" WHERE "T"."id" = "R"."relation1_id") AS "primary_to_secondary", ` +
        // Second relation
        `(SELECT json_build_object('foo', "T"."foo") FROM "ez4-test-relation" AS "T" WHERE "T"."relation2_id" = "R"."id") AS "unique_to_primary", ` +
        // Third relation
        `(SELECT COALESCE(json_agg(json_build_object('foo', "T"."foo")), '[]'::json) ` +
        `FROM "ez4-test-relation" AS "T" WHERE "T"."relation1_id" = "R"."id") AS "secondary_to_primary" ` +
        // Main condition
        `FROM "ez4-test-select-relations" AS "R" WHERE "R"."id" = :0 AND ` +
        // First relation condition
        `EXISTS (SELECT 1 FROM "ez4-test-relation" AS "T" WHERE "T"."foo" = :1 AND "T"."id" = "R"."relation1_id") AND ` +
        // Second relation condition
        `EXISTS (SELECT 1 FROM "ez4-test-relation" AS "T" WHERE "T"."foo" = :2 AND "T"."relation2_id" = "R"."id") AND ` +
        // Third relation condition
        `EXISTS (SELECT 1 FROM "ez4-test-relation" AS "T" WHERE "T"."id" = :3 AND "T"."relation1_id" = "R"."id")`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000', 123, 456, '00000000-0000-1000-9000-000000000001']);
  });

  it('assert :: prepare select relations (with connections)', ({ assert }) => {
    const [statement, variables] = prepareSelect({
      select: {
        id: true
      },
      where: {
        id: '00000000-0000-1000-9000-000000000000',
        primary_to_secondary: {},
        unique_to_primary: null,
        NOT: {
          secondary_to_primary: null
        }
      }
    });

    assert.equal(
      statement,
      `SELECT "R"."id" FROM "ez4-test-select-relations" AS "R" WHERE "R"."id" = :0 AND ` +
        // First relation
        `EXISTS (SELECT 1 FROM "ez4-test-relation" AS "T" WHERE "T"."id" = "R"."relation1_id") AND ` +
        // Second relation
        `EXISTS (SELECT 1 FROM "ez4-test-relation" AS "T" WHERE "T"."relation2_id" != "R"."id") AND ` +
        // Third relation
        `NOT EXISTS (SELECT 1 FROM "ez4-test-relation" AS "T" WHERE "T"."relation1_id" != "R"."id")`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000']);
  });

  it('assert :: prepare select relations (with include)', ({ assert }) => {
    const [statement, variables] = prepareSelect({
      select: {
        id: true,
        primary_to_secondary: {
          foo: true
        },
        unique_to_primary: {
          foo: true
        },
        secondary_to_primary: {
          foo: true
        }
      },
      include: {
        primary_to_secondary: {
          where: {}
        },
        unique_to_primary: {},
        secondary_to_primary: {
          where: {
            foo: 123
          }
        }
      },
      where: {
        id: '00000000-0000-1000-9000-000000000000'
      }
    });

    assert.equal(
      statement,
      `SELECT "R"."id", ` +
        // First relation
        `(SELECT json_build_object('foo', "T"."foo") FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."id" = "R"."relation1_id") AS "primary_to_secondary", ` +
        // Second relation
        `(SELECT json_build_object('foo', "T"."foo") FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."relation2_id" = "R"."id") AS "unique_to_primary", ` +
        // Third relation
        `(SELECT COALESCE(json_agg(json_build_object('foo', "T"."foo")), '[]'::json) FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."foo" = :0 AND "T"."relation1_id" = "R"."id") AS "secondary_to_primary" ` +
        //
        `FROM "ez4-test-select-relations" AS "R" ` +
        `WHERE "R"."id" = :1`
    );

    assert.deepEqual(variables, [123, '00000000-0000-1000-9000-000000000000']);
  });

  it('assert :: prepare select relations (with ordered include)', ({ assert }) => {
    const [statement, variables] = prepareSelect({
      select: {
        id: true,
        secondary_to_primary: {
          foo: true
        }
      },
      include: {
        secondary_to_primary: {
          where: {
            foo: 123
          },
          order: {
            foo: Order.Desc
          }
        }
      },
      where: {
        id: '00000000-0000-1000-9000-000000000000'
      }
    });

    assert.equal(
      statement,
      `SELECT "R"."id", ` +
        // First relation
        `(SELECT COALESCE(json_agg(json_build_object('foo', "T"."foo") ORDER BY "T"."foo" DESC), '[]'::json) FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."foo" = :0 AND "T"."relation1_id" = "R"."id") AS "secondary_to_primary" ` +
        //
        `FROM "ez4-test-select-relations" AS "R" ` +
        `WHERE "R"."id" = :1`
    );

    assert.deepEqual(variables, [123, '00000000-0000-1000-9000-000000000000']);
  });

  it('assert :: prepare select relations (with limited include)', ({ assert }) => {
    const [statement, variables] = prepareSelect({
      select: {
        id: true,
        secondary_to_primary: {
          foo: true
        }
      },
      include: {
        secondary_to_primary: {
          where: {
            foo: 123
          },
          skip: 5,
          take: 5
        }
      },
      where: {
        id: '00000000-0000-1000-9000-000000000000'
      }
    });

    assert.equal(
      statement,
      `SELECT "R"."id", ` +
        // First relation
        `(SELECT COALESCE(json_agg(json_build_object('foo', "foo")), '[]'::json) ` +
        `FROM (SELECT "S"."foo" FROM "ez4-test-relation" AS "S" WHERE "S"."foo" = :0 AND "S"."relation1_id" = "R"."id" OFFSET 5 LIMIT 5)` +
        `) AS "secondary_to_primary" ` +
        //
        `FROM "ez4-test-select-relations" AS "R" ` +
        `WHERE "R"."id" = :1`
    );

    assert.deepEqual(variables, [123, '00000000-0000-1000-9000-000000000000']);
  });
});
