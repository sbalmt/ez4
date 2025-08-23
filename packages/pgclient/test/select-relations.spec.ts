import type { PostgresEngine, RepositoryRelationsWithSchema } from '@ez4/pgclient/library';
import type { IndexedTables, RelationTables } from '@ez4/database/library';
import type { Database, Query } from '@ez4/database';

import { describe, it } from 'node:test';

import { prepareSelectQuery } from '@ez4/pgclient/library';
import { ObjectSchema, SchemaType } from '@ez4/schema';
import { Index, Order } from '@ez4/database';
import { SqlBuilder } from '@ez4/pgsql';

declare class Test extends Database.Service {
  engine: PostgresEngine;

  tables: [
    {
      name: 'ez4_test_table';
      indexes: {
        id: Index.Primary;
        relation1_id: Index.Secondary;
        relation2_id: Index.Unique;
      };
      relations: {
        'id@primary_to_unique': 'ez4_test_table:relation_2';
        'id@primary_to_secondary': 'ez4_test_table:relation_1';
        'relation1_id@secondary_to_unique': 'ez4_test_table:id';
      };
      schema: {
        id: string;
        foo?: number;
        relation1_id?: string;
        relation2_id?: string;
      };
    }
  ];
}

type TestTableMetadata = {
  schema: Test['tables'][0]['schema'];
  indexes: IndexedTables<Test>['ez4_test_table'];
  relations: RelationTables<Test>['ez4_test_table'];
  engine: Test['engine'];
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
    secondary_to_unique: {
      sourceSchema: testSchema,
      sourceTable: 'ez4-test-relation',
      sourceAlias: 'ez4-test-relation',
      targetColumn: 'relation1_id',
      sourceColumn: 'id',
      sourceIndex: Index.Primary,
      targetIndex: Index.Secondary
    },
    primary_to_unique: {
      sourceSchema: testSchema,
      sourceTable: 'ez4-test-relation',
      sourceAlias: 'ez4-test-relation',
      targetColumn: 'id',
      sourceColumn: 'relation2_id',
      sourceIndex: Index.Unique,
      targetIndex: Index.Primary
    },
    primary_to_secondary: {
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
        secondary_to_unique: {
          id: true
        },
        primary_to_unique: true,
        primary_to_secondary: {
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
        `FROM "ez4-test-relation" AS "T" WHERE "T"."id" = "R"."relation1_id") AS "secondary_to_unique", ` +
        // Second relation
        `(SELECT json_build_object(` +
        `'id', "T"."id", ` +
        `'relation1_id', "T"."relation1_id", ` +
        `'relation2_id', "T"."relation2_id", ` +
        `'foo', "T"."foo") ` +
        `FROM "ez4-test-relation" AS "T" WHERE "T"."relation2_id" = "R"."id") AS "primary_to_unique", ` +
        // Third relation
        `(SELECT COALESCE(json_agg(json_build_object('foo', "T"."foo")), '[]'::json) ` +
        `FROM "ez4-test-relation" AS "T" WHERE "T"."relation1_id" = "R"."id") AS "primary_to_secondary" ` +
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
        secondary_to_unique: {
          foo: true
        },
        primary_to_unique: {
          foo: true
        },
        primary_to_secondary: {
          foo: true
        }
      },
      where: {
        id: '00000000-0000-1000-9000-000000000000',
        secondary_to_unique: {
          foo: 123
        },
        primary_to_unique: {
          foo: 456
        },
        primary_to_secondary: {
          id: '00000000-0000-1000-9000-000000000001'
        }
      }
    });

    assert.equal(
      statement,
      `SELECT "R"."id", "R"."foo", ` +
        // First relation
        `(SELECT json_build_object('foo', "T"."foo") FROM "ez4-test-relation" AS "T" WHERE "T"."id" = "R"."relation1_id") AS "secondary_to_unique", ` +
        // Second relation
        `(SELECT json_build_object('foo', "T"."foo") FROM "ez4-test-relation" AS "T" WHERE "T"."relation2_id" = "R"."id") AS "primary_to_unique", ` +
        // Third relation
        `(SELECT COALESCE(json_agg(json_build_object('foo', "T"."foo")), '[]'::json) ` +
        `FROM "ez4-test-relation" AS "T" WHERE "T"."relation1_id" = "R"."id") AS "primary_to_secondary" ` +
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
        secondary_to_unique: {},
        primary_to_unique: null,
        NOT: {
          primary_to_secondary: null
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

  it('assert :: prepare select relations (with where include)', ({ assert }) => {
    const [statement, variables] = prepareSelect({
      select: {
        id: true,
        secondary_to_unique: {
          foo: true
        },
        primary_to_unique: {
          foo: true
        },
        primary_to_secondary: {
          foo: true
        }
      },
      include: {
        secondary_to_unique: {
          where: {
            foo: 123
          }
        },
        primary_to_unique: {
          where: {
            foo: 456
          }
        },
        primary_to_secondary: {
          where: {
            foo: 789
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
        `WHERE "T"."foo" = :0 AND "T"."id" = "R"."relation1_id") AS "secondary_to_unique", ` +
        // Second relation
        `(SELECT json_build_object('foo', "T"."foo") FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."foo" = :1 AND "T"."relation2_id" = "R"."id") AS "primary_to_unique", ` +
        // Third relation
        `(SELECT COALESCE(json_agg(json_build_object('foo', "T"."foo")), '[]'::json) FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."foo" = :2 AND "T"."relation1_id" = "R"."id") AS "primary_to_secondary" ` +
        //
        `FROM "ez4-test-select-relations" AS "R" ` +
        `WHERE "R"."id" = :3`
    );

    assert.deepEqual(variables, [123, 456, 789, '00000000-0000-1000-9000-000000000000']);
  });

  it('assert :: prepare select relations (with empty include)', ({ assert }) => {
    const [statement, variables] = prepareSelect({
      select: {
        id: true,
        secondary_to_unique: {
          foo: true
        },
        primary_to_unique: {
          foo: true
        },
        primary_to_secondary: {
          foo: true
        }
      },
      include: {
        secondary_to_unique: {},
        primary_to_unique: {},
        primary_to_secondary: {}
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
        `WHERE "T"."id" = "R"."relation1_id") AS "secondary_to_unique", ` +
        // Second relation
        `(SELECT json_build_object('foo', "T"."foo") FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."relation2_id" = "R"."id") AS "primary_to_unique", ` +
        // Third relation
        `(SELECT COALESCE(json_agg(json_build_object('foo', "T"."foo")), '[]'::json) FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."relation1_id" = "R"."id") AS "primary_to_secondary" ` +
        //
        `FROM "ez4-test-select-relations" AS "R" ` +
        `WHERE "R"."id" = :0`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000']);
  });

  it('assert :: prepare select relations (with order include)', ({ assert }) => {
    const [statement, variables] = prepareSelect({
      select: {
        id: true,
        primary_to_secondary: {
          foo: true
        }
      },
      include: {
        primary_to_secondary: {
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
        `WHERE "T"."foo" = :0 AND "T"."relation1_id" = "R"."id") AS "primary_to_secondary" ` +
        //
        `FROM "ez4-test-select-relations" AS "R" ` +
        `WHERE "R"."id" = :1`
    );

    assert.deepEqual(variables, [123, '00000000-0000-1000-9000-000000000000']);
  });

  it('assert :: prepare select relations (with limit include)', ({ assert }) => {
    const [statement, variables] = prepareSelect({
      select: {
        id: true,
        primary_to_secondary: {
          foo: true
        }
      },
      include: {
        primary_to_secondary: {
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
        `FROM (SELECT "S"."foo" FROM "ez4-test-relation" AS "S" ` +
        `WHERE "S"."foo" = :0 AND "S"."relation1_id" = "R"."id" OFFSET 5 LIMIT 5)` +
        `) AS "primary_to_secondary" ` +
        //
        `FROM "ez4-test-select-relations" AS "R" ` +
        `WHERE "R"."id" = :1`
    );

    assert.deepEqual(variables, [123, '00000000-0000-1000-9000-000000000000']);
  });

  it.only('assert :: prepare select nested relations', ({ assert }) => {
    const [statement, variables] = prepareSelect({
      select: {
        id: true,
        primary_to_unique: {
          foo: true
        },
        primary_to_secondary: {
          foo: true
        },
        secondary_to_unique: {
          foo: true,
          primary_to_unique: {
            foo: true
          },
          primary_to_secondary: {
            foo: true
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
        `WHERE "T"."relation2_id" = "R"."id") AS "primary_to_unique", ` +
        // Second relation
        `(SELECT COALESCE(json_agg(json_build_object('foo', "T"."foo")), '[]'::json) FROM "ez4-test-relation" AS "T" ` +
        `WHERE "T"."relation1_id" = "R"."id") AS "primary_to_secondary", ` +
        // Third relation
        `(SELECT json_build_object('foo', "T"."foo", ` +
        //
        /****/ `'primary_to_unique', (SELECT json_build_object('foo', "T"."foo") ` +
        /*****/ `FROM "ez4-test-relation" AS "T" WHERE "T"."relation2_id" = "T"."id"), ` +
        //
        /****/ `'primary_to_secondary', (SELECT COALESCE(json_agg(json_build_object('foo', "T"."foo")), '[]'::json) ` +
        /*****/ `FROM "ez4-test-relation" AS "T" WHERE "T"."relation1_id" = "T"."id")` +
        //
        `) FROM "ez4-test-relation" AS "T" WHERE "T"."id" = "R"."relation1_id") AS "secondary_to_unique" ` +
        //
        `FROM "ez4-test-select-relations" AS "R" ` +
        `WHERE "R"."id" = :0`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000']);
  });
});
