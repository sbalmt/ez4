import type { ExecuteStatementCommandInput } from '@aws-sdk/client-rds-data';
import type { Database, Relations, Query } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';
import type { RepositoryRelations } from '../../types/repository.js';

import { preparePartialSchema, validateSchema } from './schema.js';

import { prepareInsertQuery } from './insert.js';
import { prepareUpdateQuery } from './update.js';
import { prepareSelectQuery } from './select.js';
import { prepareDeleteQuery } from './delete.js';

export type PreparedQueryCommand = Pick<ExecuteStatementCommandInput, 'sql' | 'parameters'>;

export const prepareInsertOne = async <
  T extends Database.Schema,
  I extends Database.Indexes<T>,
  R extends Relations
>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelations,
  query: Query.InsertOneInput<T, I, R>
): Promise<PreparedQueryCommand> => {
  await validateSchema(query.data, schema);

  const [statement, variables] = prepareInsertQuery<T, I, R>(table, schema, relations, query);

  return {
    sql: statement,
    parameters: variables
  };
};

export const prepareFindOne = <
  T extends Database.Schema,
  I extends Database.Indexes<T>,
  R extends Relations,
  S extends Query.SelectInput<T, R>
>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelations,
  query: Query.FindOneInput<T, S, I>
): PreparedQueryCommand => {
  const [statement, variables] = prepareSelectQuery<T, I, R, S>(table, schema, relations, {
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
  I extends Database.Indexes<T>,
  R extends Relations,
  S extends Query.SelectInput<T, R>
>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelations,
  query: Query.UpdateOneInput<T, S, I, R>
): Promise<PreparedQueryCommand> => {
  await validateSchema(query.data, preparePartialSchema(schema, query.data));

  const [statement, variables] = prepareUpdateQuery<T, I, R, S>(table, schema, relations, {
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
  I extends Database.Indexes<T>,
  R extends Relations,
  S extends Query.SelectInput<T, R>
>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelations,
  query: Query.DeleteOneInput<T, S, I>
): PreparedQueryCommand => {
  const [statement, variables] = prepareDeleteQuery<T, I, R, S>(table, schema, relations, {
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

export const prepareInsertMany = async <
  T extends Database.Schema,
  I extends Database.Indexes<T>,
  R extends Relations
>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelations,
  query: Query.InsertManyInput<T>
): Promise<PreparedQueryCommand[]> => {
  return Promise.all(
    query.data.map(async (data) => {
      await validateSchema(data, schema);

      const [statement, variables] = prepareInsertQuery<T, I, R>(table, schema, relations, {
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
  I extends Database.Indexes<T>,
  R extends Relations,
  S extends Query.SelectInput<T, R>
>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelations,
  query: Query.FindManyInput<T, S, I>
): PreparedQueryCommand => {
  const [statement, variables] = prepareSelectQuery<T, I, R, S>(table, schema, relations, query);

  return {
    sql: statement,
    ...(variables.length && {
      parameters: variables
    })
  };
};

export const prepareUpdateMany = async <
  T extends Database.Schema,
  I extends Database.Indexes<T>,
  R extends Relations,
  S extends Query.SelectInput<T, R>
>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelations,
  query: Query.UpdateManyInput<T, S>
): Promise<PreparedQueryCommand> => {
  await validateSchema(query.data, preparePartialSchema(schema, query.data));

  const [statement, variables] = prepareUpdateQuery<T, I, R, S>(table, schema, relations, query);

  return {
    sql: statement,
    ...(variables.length && {
      parameters: variables
    })
  };
};

export const prepareDeleteMany = <
  T extends Database.Schema,
  I extends Database.Indexes<T>,
  R extends Relations,
  S extends Query.SelectInput<T, R>
>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelations,
  query: Query.DeleteManyInput<T, S>
): PreparedQueryCommand => {
  const [statement, variables] = prepareDeleteQuery<T, I, R, S>(table, schema, relations, query);

  return {
    sql: statement,
    ...(variables.length && {
      parameters: variables
    })
  };
};
