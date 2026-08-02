import type { IndexedTables, RelationTables } from '@ez4/database/library';
import type { PostgresEngine, PgClientDriver } from '@ez4/pgclient';
import type { Database, Query } from '@ez4/database';

import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

import {
  prepareFindOne,
  prepareInsertOne,
  prepareUpdateOne,
  prepareDeleteOne,
  prepareExists,
  prepareCount
} from '../../src/queries/queries';

import { getRelationsWithSchema } from '../../src/service/relations';
import { getTableRepository } from '../../src/utils/repository';

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

  const findOne = <S extends Query.SelectInput<TestTableMetadata>>(input: Query.FindOneInput<S, TestTableMetadata>) => {
    return prepareFindOne<TestTableMetadata, S>(testTableName, schema, relations, testDriver, input);
  };

  const insertOne = <S extends Query.SelectInput<TestTableMetadata>>(input: Query.InsertOneInput<S, TestTableMetadata>) => {
    return prepareInsertOne<TestTableMetadata, S>(testTableName, schema, relations, testDriver, input);
  };

  const updateOne = <S extends Query.SelectInput<TestTableMetadata>>(input: Query.UpdateOneInput<S, TestTableMetadata>, flag?: string) => {
    return prepareUpdateOne<TestTableMetadata, S>(testTableName, schema, relations, testDriver, input, { flag });
  };

  const deleteOne = <S extends Query.SelectInput<TestTableMetadata>>(input: Query.DeleteOneInput<S, TestTableMetadata>) => {
    return prepareDeleteOne<TestTableMetadata, S>(testTableName, schema, relations, testDriver, input);
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

    deepEqual(statement.metadata.columns, ['id', 'foo']);
  });

  it('assert :: count columns', () => {
    const statement = prepareCount(testTableName, schema, relations, testDriver, {});

    deepEqual(statement.metadata.columns, ['__EZ4_COUNT']);
  });

  it('assert :: exists columns', () => {
    const statement = prepareExists(testTableName, schema, relations, testDriver, {});

    deepEqual(statement.metadata.columns, ['__EZ4_EXISTS']);
  });

  it('assert :: update columns (with select and flag)', async () => {
    const statement = await updateOne(
      {
        select: {
          foo: true
        },
        data: {
          foo: 123
        },
        where: {
          id: testId
        }
      },
      '__EZ4_OK'
    );

    deepEqual(statement.metadata.columns, ['foo', '__EZ4_OK']);
  });

  it('assert :: update columns (with select and no flag)', async () => {
    const statement = await updateOne({
      select: {
        foo: true
      },
      data: {
        foo: 123
      },
      where: {
        id: testId
      }
    });

    deepEqual(statement.metadata.columns, ['foo']);
  });

  it('assert :: update columns (without select)', async () => {
    const statement = await updateOne({
      data: {
        foo: 123
      },
      where: {
        id: testId
      }
    });

    deepEqual(statement.metadata.columns, []);
  });

  it('assert :: insert columns (with select)', async () => {
    const statement = await insertOne({
      select: {
        id: true
      },
      data: {
        id: testId
      }
    });

    deepEqual(statement.metadata.columns, ['id']);
  });

  it('assert :: insert columns (without select)', async () => {
    const statement = await insertOne({
      data: {
        id: testId
      }
    });

    deepEqual(statement.metadata.columns, []);
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

    deepEqual(statement.metadata.columns, ['id']);
  });

  it('assert :: delete columns (without select)', () => {
    const statement = deleteOne({
      where: {
        id: testId
      }
    });

    deepEqual(statement.metadata.columns, []);
  });
});
