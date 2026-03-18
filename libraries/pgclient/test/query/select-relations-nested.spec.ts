import type { IndexedTables, RelationTables } from '@ez4/database/library';
import type { PostgresEngine } from '@ez4/pgclient/library';
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
      name: 'ez4-test-a';
      relations: {};
      indexes: {
        id: Index.Primary;
      };
      schema: {
        id: string;
      };
    },
    {
      name: 'ez4-test-b';
      indexes: {
        id: Index.Primary;
        relation_a_id: Index.Secondary;
        relation_c_id: Index.Unique;
      };
      relations: {
        'relation_a_id@relation_a': 'ez4-test-a:id';
        'relation_c_id@relation_c': 'ez4-test-c:id';
      };
      schema: {
        id: string;
        relation_a_id: string;
        relation_c_id?: string;
      };
    },
    {
      name: 'ez4-test-c';
      indexes: {
        id: Index.Primary;
        relation_b_id: Index.Secondary;
      };
      relations: {
        'relation_b_id@relation_b': 'ez4-test-b:id';
      };
      schema: {
        id: string;
        relation_b_id?: string;
        column: number;
      };
    },
    {
      name: 'ez4-test-d';
      indexes: {
        id: Index.Primary;
        relation_cb_id: Index.Secondary;
      };
      relations: {
        'relation_cb_id@relation_cb': 'ez4-test-c:relation_b_id';
      };
      schema: {
        id: string;
        relation_cb_id?: string;
      };
    }
  ];
}

type TestTableBMetadata = {
  schema: Test['tables'][0]['schema'];
  indexes: IndexedTables<Test>['ez4-test-b'];
  relations: RelationTables<Test>['ez4-test-b'];
  engine: Test['engine'];
};

type TestTableCMetadata = {
  schema: Test['tables'][0]['schema'];
  indexes: IndexedTables<Test>['ez4-test-c'];
  relations: RelationTables<Test>['ez4-test-c'];
  engine: Test['engine'];
};

type TestTableDMetadata = {
  schema: Test['tables'][0]['schema'];
  indexes: IndexedTables<Test>['ez4-test-d'];
  relations: RelationTables<Test>['ez4-test-d'];
  engine: Test['engine'];
};

describe('select nested relations', () => {
  const repository = getTableRepository([
    {
      name: 'ez4-test-a',
      indexes: [],
      relations: [],
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
          }
        }
      }
    },
    {
      name: 'ez4-test-b',
      indexes: [],
      relations: [
        {
          targetAlias: 'relation_a',
          targetColumn: 'relation_a_id',
          targetIndex: Index.Secondary,
          sourceIndex: Index.Primary,
          sourceTable: 'ez4-test-a',
          sourceColumn: 'id'
        },
        {
          targetAlias: 'relation_c',
          targetColumn: 'relation_c_id',
          targetIndex: Index.Unique,
          sourceIndex: Index.Primary,
          sourceTable: 'ez4-test-c',
          sourceColumn: 'id'
        }
      ],
      schema: {
        type: SchemaType.Object,
        properties: {
          id: {
            type: SchemaType.String,
            format: 'uuid'
          },
          relation_a_id: {
            type: SchemaType.String,
            format: 'uuid'
          },
          relation_c_id: {
            type: SchemaType.String,
            optional: true,
            format: 'uuid'
          }
        }
      }
    },
    {
      name: 'ez4-test-c',
      indexes: [],
      relations: [
        {
          targetAlias: 'relation_b',
          targetColumn: 'relation_b_id',
          targetIndex: Index.Secondary,
          sourceIndex: Index.Primary,
          sourceTable: 'ez4-test-b',
          sourceColumn: 'id'
        }
      ],
      schema: {
        type: SchemaType.Object,
        properties: {
          id: {
            type: SchemaType.String,
            format: 'uuid'
          },
          relation_b_id: {
            type: SchemaType.String,
            optional: true,
            format: 'uuid'
          },
          column: {
            type: SchemaType.Number
          }
        }
      }
    },
    {
      name: 'ez4-test-d',
      indexes: [],
      relations: [
        {
          targetAlias: 'relation_cb',
          targetColumn: 'relation_cb_id',
          targetIndex: Index.Secondary,
          sourceIndex: Index.Secondary,
          sourceTable: 'ez4-test-c',
          sourceColumn: 'relation_b_id'
        }
      ],
      schema: {
        type: SchemaType.Object,
        properties: {
          id: {
            type: SchemaType.String,
            format: 'uuid'
          },
          relation_cb_id: {
            type: SchemaType.String,
            format: 'uuid'
          }
        }
      }
    }
  ]);

  const prepareBSelect = <S extends Query.SelectInput<TestTableBMetadata>>(query: Query.FindOneInput<S, TestTableBMetadata>) => {
    const builder = new SqlBuilder();

    const name = 'ez4-test-b';
    const table = repository[name];

    const relations = getRelationsWithSchema(name, repository);

    const selectQuery = prepareSelectQuery(builder, name, table.schema, relations, query);

    return selectQuery.build();
  };

  const prepareCSelect = <S extends Query.SelectInput<TestTableCMetadata>>(query: Query.FindOneInput<S, TestTableCMetadata>) => {
    const builder = new SqlBuilder();

    const name = 'ez4-test-c';
    const table = repository[name];

    const relations = getRelationsWithSchema(name, repository);

    const selectQuery = prepareSelectQuery(builder, name, table.schema, relations, query);

    return selectQuery.build();
  };

  const prepareDSelect = <S extends Query.SelectInput<TestTableDMetadata>>(query: Query.FindOneInput<S, TestTableDMetadata>) => {
    const builder = new SqlBuilder();

    const name = 'ez4-test-d';
    const table = repository[name];

    const relations = getRelationsWithSchema(name, repository);

    const selectQuery = prepareSelectQuery(builder, name, table.schema, relations, query);

    return selectQuery.build();
  };

  it('assert :: prepare select nested relations (one nested level)', ({ assert }) => {
    const [statement, variables] = prepareBSelect({
      select: {
        id: true,
        relation_a: {
          id: true
        },
        relation_c: {
          id: true,
          relation_b: {
            id: true
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
        `(SELECT jsonb_build_object('id', "S0"."id") FROM "ez4-test-a" AS "S0" ` +
        `WHERE "S0"."id" = "R0"."relation_a_id" LIMIT 1) AS "relation_a", ` +
        // Second relation
        `(SELECT jsonb_build_object('id', "S1"."id", ` +
        //
        /**/ `'relation_b', (SELECT jsonb_build_object('id', "S2"."id") ` +
        /**/ `FROM "ez4-test-b" AS "S2" WHERE "S2"."id" = "S1"."relation_b_id" LIMIT 1)` +
        //
        `) FROM "ez4-test-c" AS "S1" WHERE "S1"."id" = "R0"."relation_c_id" LIMIT 1) AS "relation_c" ` +
        `FROM "ez4-test-b" AS "R0" ` +
        `WHERE "R0"."id" = :0`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000']);
  });

  it('assert :: prepare select nested relations (two nested levels)', ({ assert }) => {
    const [statement, variables] = prepareCSelect({
      select: {
        id: true,
        relation_b: {
          id: true,
          relation_c: {
            id: true
          },
          relation_a: {
            id: true
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
        `(SELECT jsonb_build_object('id', "S0"."id", ` +
        //
        /**/ `'relation_c', (SELECT jsonb_build_object('id', "S1"."id") FROM "ez4-test-c" AS "S1" ` +
        /**/ `WHERE "S1"."id" = "S0"."relation_c_id" LIMIT 1), ` +
        /**/ `'relation_a', (SELECT jsonb_build_object('id', "S2"."id") FROM "ez4-test-a" AS "S2" ` +
        /**/ `WHERE "S2"."id" = "S0"."relation_a_id" LIMIT 1)` +
        //
        `) FROM "ez4-test-b" AS "S0" WHERE "S0"."id" = "R0"."relation_b_id" LIMIT 1) AS "relation_b" ` +
        `FROM "ez4-test-c" AS "R0" ` +
        `WHERE "R0"."id" = :0`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000']);
  });

  it('assert :: prepare select nested relations (with include, order, skip and take)', ({ assert }) => {
    const [statement, variables] = prepareDSelect({
      select: {
        id: true,
        relation_cb: {
          id: true
        }
      },
      include: {
        relation_cb: {
          where: {
            column: {
              gt: 100
            }
          },
          order: {
            column: Order.Desc
          },
          skip: 1,
          take: 2
        }
      },
      where: {
        id: '00000000-0000-1000-9000-000000000000'
      }
    });

    assert.equal(
      statement,
      `SELECT "R0"."id", ` +
        `(SELECT COALESCE(json_agg(jsonb_build_object('id', "id", 'column', "column") ORDER BY "column" DESC), '[]'::json) ` +
        /**/ `FROM (` +
        /****/ `SELECT "S0"."id", "S0"."column" FROM "ez4-test-c" AS "S0" ` +
        /****/ `WHERE "S0"."column" > :0 AND "S0"."relation_b_id" = "R0"."relation_cb_id" ` +
        /****/ `ORDER BY "S0"."column" DESC ` +
        /****/ `OFFSET 1 ` +
        /****/ `LIMIT 2` +
        /**/ `) AS "S0"` +
        `) AS "relation_cb" ` +
        `FROM "ez4-test-d" AS "R0" ` +
        `WHERE "R0"."id" = :1`
    );

    assert.deepEqual(variables, [100, '00000000-0000-1000-9000-000000000000']);
  });
});
