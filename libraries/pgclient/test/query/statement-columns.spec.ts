import type { PostgresEngine } from '@ez4/pgclient/library';
import type { IndexedTables, RelationTables } from '@ez4/database/library';
import type { PgClientDriver } from '@ez4/pgclient';
import type { Database, Query } from '@ez4/database';

import { describe, it } from 'node:test';
import { deepEqual, equal, ok } from 'node:assert';

import { getRelationsWithSchema, getTableRepository } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

import {
  prepareInsertOne,
  prepareFindOne,
  prepareUpdateOne,
  prepareUpdateMany,
  prepareDeleteOne,
  prepareExists,
  prepareCount
} from '../../src/queries/queries';

declare class Test extends Database.Service<PostgresEngine> {
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
        created_at?: string;
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

describe('statement columns', () => {
  const testTableName = 'ez4_test_table';
  const testId = '00000000-0000-1000-9000-000000000000';

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
          },
          created_at: {
            type: SchemaType.String,
            optional: true,
            format: 'date-time'
          }
        }
      }
    }
  ]);

  const testDriver: PgClientDriver = {
    prepareVariable: (_name, value) => value,
    executeStatement: () => Promise.reject(new Error('Not supported.')),
    executeStatements: () => Promise.reject(new Error('Not supported.')),
    executeTransaction: () => Promise.reject(new Error('Not supported.')),
    beginTransaction: () => Promise.reject(new Error('Not supported.')),
    commitTransaction: () => Promise.reject(new Error('Not supported.')),
    rollbackTransaction: () => Promise.reject(new Error('Not supported.'))
  };

  const relations = getRelationsWithSchema(testTableName, repository);
  const schema = repository[testTableName].schema;

  const findOne = <S extends Query.SelectInput<TestTableMetadata>>(query: Query.FindOneInput<S, TestTableMetadata>) => {
    return prepareFindOne<TestTableMetadata, S>(testTableName, schema, relations, testDriver, query);
  };

  const insertOne = <S extends Query.SelectInput<TestTableMetadata>>(query: Query.InsertOneInput<S, TestTableMetadata>) => {
    return prepareInsertOne<TestTableMetadata, S>(testTableName, schema, relations, testDriver, query);
  };

  const deleteOne = <S extends Query.SelectInput<TestTableMetadata>>(query: Query.DeleteOneInput<S, TestTableMetadata>) => {
    return prepareDeleteOne<TestTableMetadata, S>(testTableName, schema, relations, testDriver, query);
  };

  it('assert :: select columns', () => {
    const statement = findOne({
      select: {
        id: true,
        foo: true
      },
      where: {
        id: testId
      }
    });

    deepEqual(statement.columns, ['id', 'foo']);
  });

  it('assert :: select columns (with formatted date-time)', () => {
    const statement = findOne({
      select: {
        id: true,
        created_at: true
      },
      where: {
        id: testId
      }
    });

    deepEqual(statement.columns, ['id', 'created_at']);

    ok(statement.query.includes('to_char("created_at"'));
    ok(statement.query.includes('AS "created_at"'));
  });

  it('assert :: select columns (with relation sub-select)', () => {
    const statement = findOne({
      select: {
        id: true,
        primary_to_unique: {
          id: true
        }
      },
      where: {
        id: testId
      }
    });

    // Names are captured before build(): building reassigns the sub-select
    // alias to a temporary one while emitting the original in the SQL.
    deepEqual(statement.columns, ['id', 'primary_to_unique']);

    ok(statement.query.includes('AS "primary_to_unique"'));
  });

  it('assert :: count columns', () => {
    const statement = prepareCount(testTableName, schema, relations, testDriver, {});

    deepEqual(statement.columns, ['__EZ4_COUNT']);
  });

  it('assert :: exists columns', () => {
    const statement = prepareExists(testTableName, schema, relations, testDriver, {
      where: {
        id: testId
      }
    });

    deepEqual(statement.columns, ['__EZ4_EXISTS']);
  });

  it('assert :: no columns on update without select', async () => {
    const statement = await prepareUpdateMany<TestTableMetadata, never>(testTableName, schema, relations, testDriver, {
      data: {
        foo: 123
      }
    });

    deepEqual(statement.columns, []);
  });

  it('assert :: update columns (with flag)', async () => {
    const statement = await prepareUpdateOne<TestTableMetadata, never>(
      testTableName,
      schema,
      relations,
      testDriver,
      {
        data: {
          foo: 123
        },
        where: {
          id: testId
        }
      },
      {
        flag: '__EZ4_OK'
      }
    );

    deepEqual(statement.columns, ['__EZ4_OK']);
  });

  it('assert :: no columns on insert without select', async () => {
    const statement = await insertOne({
      data: {
        id: testId
      }
    });

    deepEqual(statement.columns, []);
  });

  it('assert :: unknown columns on insert with select', async () => {
    const statement = await insertOne({
      select: {
        id: true
      },
      data: {
        id: testId
      }
    });

    equal(statement.columns, undefined);
  });

  it('assert :: delete columns (with select)', () => {
    const statement = deleteOne({
      select: {
        id: true
      },
      where: {
        id: testId
      }
    });

    deepEqual(statement.columns, ['id']);
  });
});
