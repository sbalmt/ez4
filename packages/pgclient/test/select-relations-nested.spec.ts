import type { IndexedTables, RelationTables } from '@ez4/database/library';
import type { PostgresEngine } from '@ez4/pgclient/library';
import type { Database, Query } from '@ez4/database';

import { describe, it } from 'node:test';

import { getRelationsWithSchema, getTableRepository, prepareSelectQuery } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';
import { SqlBuilder } from '@ez4/pgsql';
import { Index } from '@ez4/database';

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

    return prepareSelectQuery(name, table.schema, relations, query, builder);
  };

  const prepareCSelect = <S extends Query.SelectInput<TestTableCMetadata>>(query: Query.FindOneInput<S, TestTableCMetadata>) => {
    const builder = new SqlBuilder();

    const name = 'ez4-test-c';
    const table = repository[name];

    const relations = getRelationsWithSchema(name, repository);

    return prepareSelectQuery(name, table.schema, relations, query, builder);
  };

  it('assert :: prepare select nested relations', ({ assert }) => {
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
        `(SELECT json_build_object('id', "S0"."id") FROM "ez4-test-a" AS "S0" ` +
        `WHERE "S0"."id" = "R0"."relation_a_id") AS "relation_a", ` +
        // Second relation
        `(SELECT json_build_object('id', "S1"."id", ` +
        //
        /**/ `'relation_b', (SELECT json_build_object('id', "S2"."id") ` +
        /**/ `FROM "ez4-test-b" AS "S2" WHERE "S2"."id" = "S1"."relation_b_id")` +
        //
        `) FROM "ez4-test-c" AS "S1" WHERE "S1"."id" = "R0"."relation_c_id") AS "relation_c" ` +
        `FROM "ez4-test-b" AS "R0" ` +
        `WHERE "R0"."id" = :0`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000']);
  });

  it('assert :: prepare select nested relations', ({ assert }) => {
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
        `(SELECT json_build_object('id', "S0"."id", ` +
        //
        /**/ `'relation_c', (SELECT json_build_object('id', "S1"."id") FROM "ez4-test-c" AS "S1" WHERE "S1"."id" = "S0"."relation_c_id"), ` +
        /**/ `'relation_a', (SELECT json_build_object('id', "S2"."id") FROM "ez4-test-a" AS "S2" WHERE "S2"."id" = "S0"."relation_a_id")` +
        //
        `) FROM "ez4-test-b" AS "S0" WHERE "S0"."id" = "R0"."relation_b_id") AS "relation_b" ` +
        `FROM "ez4-test-c" AS "R0" ` +
        `WHERE "R0"."id" = :0`
    );

    assert.deepEqual(variables, ['00000000-0000-1000-9000-000000000000']);
  });
});
