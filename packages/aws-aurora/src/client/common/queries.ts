import type { ExecuteStatementCommandInput } from '@aws-sdk/client-rds-data';
import type { ObjectSchema } from '@ez4/schema';
import type { Query } from '@ez4/database';
import type { RepositoryRelationsWithSchema } from '../../types/repository.js';
import type { InternalTableMetadata } from '../types.js';

import { prepareInsertQuery } from './insert.js';
import { prepareUpdateQuery } from './update.js';
import { prepareSelectQuery } from './select.js';
import { prepareDeleteQuery } from './delete.js';
import { prepareCountQuery } from './count.js';

export type PreparedQueryCommand = Pick<ExecuteStatementCommandInput, 'sql' | 'parameters'>;

export const prepareInsertOne = async <T extends InternalTableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.InsertOneInput<S, T>
): Promise<PreparedQueryCommand> => {
  const [statement, variables] = await prepareInsertQuery(table, schema, relations, query);

  return {
    sql: statement,
    parameters: variables
  };
};

export const prepareFindOne = <T extends InternalTableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.FindOneInput<S, T>
): PreparedQueryCommand => {
  const [statement, variables] = prepareSelectQuery(table, schema, relations, query);

  return {
    sql: statement,
    ...(variables.length && {
      parameters: variables
    })
  };
};

export const prepareUpdateOne = async <T extends InternalTableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.UpdateOneInput<S, T>
): Promise<PreparedQueryCommand> => {
  const [statement, variables] = await prepareUpdateQuery(table, schema, relations, query);

  return {
    sql: statement,
    ...(variables.length && {
      parameters: variables
    })
  };
};

export const prepareDeleteOne = <T extends InternalTableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.DeleteOneInput<S, T>
): PreparedQueryCommand => {
  const [statement, variables] = prepareDeleteQuery(table, schema, relations, query);

  return {
    sql: statement,
    ...(variables.length && {
      parameters: variables
    })
  };
};

export const prepareInsertMany = async <T extends InternalTableMetadata>(
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

export const prepareFindMany = <T extends InternalTableMetadata, S extends Query.SelectInput<T>, C extends boolean>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.FindManyInput<S, T, C>
): PreparedQueryCommand => {
  const [statement, variables] = prepareSelectQuery(table, schema, relations, query);

  return {
    sql: statement,
    ...(variables.length && {
      parameters: variables
    })
  };
};

export const prepareUpdateMany = async <T extends InternalTableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.UpdateManyInput<S, T>
): Promise<PreparedQueryCommand> => {
  const [statement, variables] = await prepareUpdateQuery(table, schema, relations, query);

  return {
    sql: statement,
    ...(variables.length && {
      parameters: variables
    })
  };
};

export const prepareDeleteMany = <T extends InternalTableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.DeleteManyInput<S, T>
): PreparedQueryCommand => {
  const [statement, variables] = prepareDeleteQuery(table, schema, relations, query);

  return {
    sql: statement,
    ...(variables.length && {
      parameters: variables
    })
  };
};

export const prepareCount = <T extends InternalTableMetadata>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.CountInput<T>
): PreparedQueryCommand => {
  const [statement, variables] = prepareCountQuery(table, schema, relations, query);

  return {
    sql: statement,
    ...(variables.length && {
      parameters: variables
    })
  };
};
