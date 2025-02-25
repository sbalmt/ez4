import type { Database, RelationMetadata, Query } from '@ez4/database';
import type { ExecuteStatementCommandInput } from '@aws-sdk/client-rds-data';
import type { ObjectSchema } from '@ez4/schema';
import type { RepositoryRelationsWithSchema } from '../../types/repository.js';

import { getInsertSchema, getUpdateSchema, validateSchema } from './schema.js';

import { prepareInsertQuery } from './insert.js';
import { prepareUpdateQuery } from './update.js';
import { prepareSelectQuery } from './select.js';
import { prepareDeleteQuery } from './delete.js';
import { prepareCountQuery } from './count.js';

export type PreparedQueryCommand = Pick<ExecuteStatementCommandInput, 'sql' | 'parameters'>;

export const prepareInsertOne = async <T extends Database.Schema, R extends RelationMetadata>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.InsertOneInput<T, R>
): Promise<PreparedQueryCommand> => {
  await validateSchema(query.data, getInsertSchema(schema, relations, query.data));

  const [statement, variables] = prepareInsertQuery(table, schema, relations, query);

  return {
    sql: statement,
    parameters: variables
  };
};

export const prepareFindOne = <
  T extends Database.Schema,
  S extends Query.SelectInput<T, R>,
  I extends Database.Indexes<T>,
  R extends RelationMetadata
>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.FindOneInput<T, S, I, R>
): PreparedQueryCommand => {
  const [statement, variables] = prepareSelectQuery(table, schema, relations, {
    ...query,
    limit: 1
  });

  return {
    sql: statement,
    ...(variables.length && {
      parameters: variables
    })
  };
};

export const prepareUpdateOne = async <
  T extends Database.Schema,
  S extends Query.SelectInput<T, R>,
  I extends Database.Indexes<T>,
  R extends RelationMetadata
>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.UpdateOneInput<T, S, I, R>
): Promise<PreparedQueryCommand> => {
  await validateSchema(query.data, getUpdateSchema(schema, relations, query.data));

  const [statement, variables] = prepareUpdateQuery(table, schema, relations, {
    ...query
    // limit: 1
  });

  return {
    sql: statement,
    ...(variables.length && {
      parameters: variables
    })
  };
};

export const prepareDeleteOne = <
  T extends Database.Schema,
  S extends Query.SelectInput<T, R>,
  I extends Database.Indexes<T>,
  R extends RelationMetadata
>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.DeleteOneInput<T, S, I, R>
): PreparedQueryCommand => {
  const [statement, variables] = prepareDeleteQuery(table, schema, relations, {
    ...query,
    limit: 1
  });

  return {
    sql: statement,
    ...(variables.length && {
      parameters: variables
    })
  };
};

export const prepareInsertMany = async <T extends Database.Schema>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.InsertManyInput<T>
): Promise<PreparedQueryCommand[]> => {
  return Promise.all(
    query.data.map(async (data) => {
      await validateSchema(data, getInsertSchema(schema, relations, data));

      const [statement, variables] = prepareInsertQuery<
        T,
        { indexes: never; selects: {}; filters: {}; changes: {} }
      >(table, schema, relations, {
        data
      });

      return {
        sql: statement,
        ...(variables.length && {
          parameters: variables
        })
      };
    })
  );
};

export const prepareFindMany = <
  T extends Database.Schema,
  S extends Query.SelectInput<T, R>,
  I extends Database.Indexes<T>,
  R extends RelationMetadata
>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.FindManyInput<T, S, I, R>
): PreparedQueryCommand => {
  const [statement, variables] = prepareSelectQuery(table, schema, relations, query);

  return {
    sql: statement,
    ...(variables.length && {
      parameters: variables
    })
  };
};

export const prepareUpdateMany = async <
  T extends Database.Schema,
  S extends Query.SelectInput<T, R>,
  R extends RelationMetadata
>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.UpdateManyInput<T, S, R>
): Promise<PreparedQueryCommand> => {
  await validateSchema(query.data, getUpdateSchema(schema, relations, query.data));

  const [statement, variables] = prepareUpdateQuery(table, schema, relations, query);

  return {
    sql: statement,
    ...(variables.length && {
      parameters: variables
    })
  };
};

export const prepareDeleteMany = <
  T extends Database.Schema,
  S extends Query.SelectInput<T, R>,
  R extends RelationMetadata
>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.DeleteManyInput<T, S, R>
): PreparedQueryCommand => {
  const [statement, variables] = prepareDeleteQuery(table, schema, relations, query);

  return {
    sql: statement,
    ...(variables.length && {
      parameters: variables
    })
  };
};

export const prepareCount = <T extends Database.Schema, R extends RelationMetadata>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.CountInput<T, R>
): PreparedQueryCommand => {
  const [statement, variables] = prepareCountQuery(table, schema, relations, query);

  return {
    sql: statement,
    ...(variables.length && {
      parameters: variables
    })
  };
};
