import type { PostgresEngine } from '@ez4/pgclient/library';
import type { IndexedTables, RelationTables } from '@ez4/database/library';
import type { Database, Query } from '@ez4/database';

import { describe, it } from 'node:test';

import { getRelationsWithSchema, getTableRepository, prepareSelectQuery } from '@ez4/pgclient/library';
import { Index, Order } from '@ez4/database';
import { SchemaType } from '@ez4/schema';
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
  const testTableName = 'ez4_test_table';

  const repository = getTableRepository([
    {
      name: testTableName,
      indexes: [],
      relations: [
        {
          targetAlias: 'secondary_to_unique',
          targetColumn: 'relation1_id',
          targetIndex: Index.Secondary,
          sourceIndex: Index.Primary,
          sourceTable: testTableName,
          sourceColumn: 'id'
        },
        {
          targetAlias: 'primary_to_unique',
          targetColumn: 'id',
          targetIndex: Index.Primary,
          sourceIndex: Index.Unique,
          sourceTable: testTableName,
          sourceColumn: 'relation2_id'
        },
        {
          targetAlias: 'primary_to_secondary',
          targetColumn: 'id',
          targetIndex: Index.Primary,
          sourceIndex: Index.Secondary,
          sourceTable: testTableName,
          sourceColumn: 'relation1_id'
        }
      ],
      schema: {
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
      }
    }
  ]);

  const prepareSelect = <S extends Query.SelectInput<TestTableMetadata>>(query: Query.FindOneInput<S, TestTableMetadata>) => {
    const builder = new SqlBuilder();

    const relations = getRelationsWithSchema(testTableName, repository);
    const table = repository[testTableName];

    const selectQuery = prepareSelectQuery(builder, testTableName, table.schema, relations, query);

    return selectQuery.build();
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
      `SELECT "R0"."id", "R0"."foo", ` +
        // First relation
        `(SELECT jsonb_build_object('id', "S0"."id") ` +
        `FROM "ez4_test_table" AS "S0" WHERE "S0"."id" = "R0"."relation1_id" LIMIT 1) AS "secondary_to_unique", ` +
        // Second relation
        `(SELECT jsonb_build_object(` +
        `'id', "S1"."id", ` +
        `'relation1_id', "S1"."relation1_id", ` +
        `'relation2_id', "S1"."relation2_id", ` +
        `'foo', "S1"."foo") ` +
        `FROM "ez4_test_table" AS "S1" WHERE "S1"."relation2_id" = "R0"."id" LIMIT 1) AS "primary_to_unique", ` +
        // Third relation
        `(SELECT COALESCE(json_agg(jsonb_build_object('foo', "S2"."foo")), '[]'::json) ` +
        `FROM "ez4_test_table" AS "S2" WHERE "S2"."relation1_id" = "R0"."id") AS "primary_to_secondary" ` +
        //
        `FROM "ez4_test_table" AS "R0" ` +
        `WHERE "R0"."id" = :0`
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
      `SELECT "R0"."id", "R0"."foo", ` +
        // First relation
        `(SELECT jsonb_build_object('foo', "S0"."foo") FROM "ez4_test_table" AS "S0" ` +
        `WHERE "S0"."id" = "R0"."relation1_id" LIMIT 1) AS "secondary_to_unique", ` +
        // Second relation
        `(SELECT jsonb_build_object('foo', "S1"."foo") FROM "ez4_test_table" AS "S1" ` +
        `WHERE "S1"."relation2_id" = "R0"."id" LIMIT 1) AS "primary_to_unique", ` +
        // Third relation
        `(SELECT COALESCE(json_agg(jsonb_build_object('foo', "S2"."foo")), '[]'::json) ` +
        `FROM "ez4_test_table" AS "S2" WHERE "S2"."relation1_id" = "R0"."id") AS "primary_to_secondary" ` +
        // Main condition
        `FROM "ez4_test_table" AS "R0" WHERE "R0"."id" = :0 AND ` +
        // First relation condition
        `EXISTS (SELECT 1 FROM "ez4_test_table" AS "T" WHERE "T"."foo" = :1 AND "T"."id" = "R0"."relation1_id") AND ` +
        // Second relation condition
        `EXISTS (SELECT 1 FROM "ez4_test_table" AS "T" WHERE "T"."foo" = :2 AND "T"."relation2_id" = "R0"."id") AND ` +
        // Third relation condition
        `EXISTS (SELECT 1 FROM "ez4_test_table" AS "T" WHERE "T"."id" = :3 AND "T"."relation1_id" = "R0"."id")`
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
      `SELECT "R0"."id" FROM "ez4_test_table" AS "R0" WHERE "R0"."id" = :0 AND ` +
        // First relation
        `EXISTS (SELECT 1 FROM "ez4_test_table" AS "T" WHERE "T"."id" = "R0"."relation1_id") AND ` +
        // Second relation
        `EXISTS (SELECT 1 FROM "ez4_test_table" AS "T" WHERE "T"."relation2_id" != "R0"."id") AND ` +
        // Third relation
        `NOT EXISTS (SELECT 1 FROM "ez4_test_table" AS "T" WHERE "T"."relation1_id" != "R0"."id")`
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
      `SELECT "R0"."id", ` +
        // First relation
        `(SELECT jsonb_build_object('foo', "S0"."foo") FROM "ez4_test_table" AS "S0" ` +
        `WHERE "S0"."foo" = :0 AND "S0"."id" = "R0"."relation1_id" LIMIT 1) AS "secondary_to_unique", ` +
        // Second relation
        `(SELECT jsonb_build_object('foo', "S1"."foo") FROM "ez4_test_table" AS "S1" ` +
        `WHERE "S1"."foo" = :1 AND "S1"."relation2_id" = "R0"."id" LIMIT 1) AS "primary_to_unique", ` +
        // Third relation
        `(SELECT COALESCE(json_agg(jsonb_build_object('foo', "S2"."foo")), '[]'::json) FROM "ez4_test_table" AS "S2" ` +
        `WHERE "S2"."foo" = :2 AND "S2"."relation1_id" = "R0"."id") AS "primary_to_secondary" ` +
        //
        `FROM "ez4_test_table" AS "R0" ` +
        `WHERE "R0"."id" = :3`
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
      `SELECT "R0"."id", ` +
        // First relation
        `(SELECT jsonb_build_object('foo', "S0"."foo") FROM "ez4_test_table" AS "S0" ` +
        `WHERE "S0"."id" = "R0"."relation1_id" LIMIT 1) AS "secondary_to_unique", ` +
        // Second relation
        `(SELECT jsonb_build_object('foo', "S1"."foo") FROM "ez4_test_table" AS "S1" ` +
        `WHERE "S1"."relation2_id" = "R0"."id" LIMIT 1) AS "primary_to_unique", ` +
        // Third relation
        `(SELECT COALESCE(json_agg(jsonb_build_object('foo', "S2"."foo")), '[]'::json) FROM "ez4_test_table" AS "S2" ` +
        `WHERE "S2"."relation1_id" = "R0"."id") AS "primary_to_secondary" ` +
        //
        `FROM "ez4_test_table" AS "R0" ` +
        `WHERE "R0"."id" = :0`
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
      `SELECT "R0"."id", ` +
        // First relation
        `(SELECT COALESCE(json_agg(jsonb_build_object('foo', "S0"."foo") ORDER BY "S0"."foo" DESC), '[]'::json) FROM "ez4_test_table" AS "S0" ` +
        `WHERE "S0"."foo" = :0 AND "S0"."relation1_id" = "R0"."id") AS "primary_to_secondary" ` +
        //
        `FROM "ez4_test_table" AS "R0" ` +
        `WHERE "R0"."id" = :1`
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
      `SELECT "R0"."id", ` +
        // First relation
        `(SELECT COALESCE(json_agg(jsonb_build_object('foo', "foo")), '[]'::json) ` +
        `FROM (` +
        `SELECT "S0"."foo" FROM "ez4_test_table" AS "S0" ` +
        `WHERE "S0"."foo" = :0 AND "S0"."relation1_id" = "R0"."id" OFFSET 5 LIMIT 5` +
        `) AS "S0"` +
        `) AS "primary_to_secondary" ` +
        //
        `FROM "ez4_test_table" AS "R0" ` +
        `WHERE "R0"."id" = :1`
    );

    assert.deepEqual(variables, [123, '00000000-0000-1000-9000-000000000000']);
  });

  it('assert :: prepare select nested relations', ({ assert }) => {
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
      `SELECT "R0"."id", ` +
        // First relation
        `(SELECT jsonb_build_object('foo', "S0"."foo") FROM "ez4_test_table" AS "S0" ` +
        `WHERE "S0"."relation2_id" = "R0"."id" LIMIT 1) AS "primary_to_unique", ` +
        // Second relation
        `(SELECT COALESCE(json_agg(jsonb_build_object('foo', "S1"."foo")), '[]'::json) FROM "ez4_test_table" AS "S1" ` +
        `WHERE "S1"."relation1_id" = "R0"."id") AS "primary_to_secondary", ` +
        // Third relation
        `(SELECT jsonb_build_object('foo', "S2"."foo", ` +
        //
        /****/ `'primary_to_unique', (SELECT jsonb_build_object('foo', "S3"."foo") ` +
        /****/ `FROM "ez4_test_table" AS "S3" WHERE "S3"."relation2_id" = "S2"."id" LIMIT 1), ` +
        //
        /****/ `'primary_to_secondary', (SELECT COALESCE(json_agg(jsonb_build_object('foo', "S4"."foo")), '[]'::json) ` +
        /****/ `FROM "ez4_test_table" AS "S4" WHERE "S4"."relation1_id" = "S2"."id")` +
        //
        `) FROM "ez4_test_table" AS "S2" WHERE "S2"."id" = "R0"."relation1_id" LIMIT 1) AS "secondary_to_unique" ` +
        //
        `FROM "ez4_test_table" AS "R0" ` +
        `WHERE "R0"."id" = :0`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000']);
  });
});
