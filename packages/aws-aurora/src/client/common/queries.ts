import type { ExecuteStatementCommandInput } from '@aws-sdk/client-rds-data';
import type { Database, RelationMetadata, Query } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';
import type { RepositoryRelationsWithSchema } from '../../types/repository.js';

import { prepareInsertQuery } from './insert.js';
import { prepareUpdateQuery } from './update.js';
import { prepareSelectQuery } from './select.js';
import { prepareDeleteQuery } from './delete.js';
import { prepareCountQuery } from './count.js';

export type PreparedQueryCommand = Pick<ExecuteStatementCommandInput, 'sql' | 'parameters'>;

export const prepareInsertOne = async <T extends Database.Schema, S extends Query.SelectInput<T, R>, R extends RelationMetadata>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.InsertOneInput<T, S, R>
): Promise<PreparedQueryCommand> => {
  const [statement, variables] = await prepareInsertQuery(table, schema, relations, query);

  return {
    sql: statement,
    parameters: variables
  };
};

export const prepareFindOne = <
  T extends Database.Schema,
  S extends Query.SelectInput<T, R>,
  I extends Database.Indexes,
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
  I extends Database.Indexes,
  R extends RelationMetadata
>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.UpdateOneInput<T, S, I, R>
): Promise<PreparedQueryCommand> => {
  const [statement, variables] = await prepareUpdateQuery(table, schema, relations, {
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
  I extends Database.Indexes,
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
      const [statement, variables] = await prepareInsertQuery(table, schema, relations, {
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
  I extends Database.Indexes,
  R extends RelationMetadata,
  C extends boolean
>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.FindManyInput<T, S, I, R, C>
): PreparedQueryCommand => {
  const [statement, variables] = prepareSelectQuery(table, schema, relations, query);

  return {
    sql: statement,
    ...(variables.length && {
      parameters: variables
    })
  };
};

export const prepareUpdateMany = async <T extends Database.Schema, S extends Query.SelectInput<T, R>, R extends RelationMetadata>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.UpdateManyInput<T, S, R>
): Promise<PreparedQueryCommand> => {
  const [statement, variables] = await prepareUpdateQuery(table, schema, relations, query);

  return {
    sql: statement,
    ...(variables.length && {
      parameters: variables
    })
  };
};

export const prepareDeleteMany = <T extends Database.Schema, S extends Query.SelectInput<T, R>, R extends RelationMetadata>(
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
