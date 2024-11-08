import type { ExecuteStatementCommandInput } from '@aws-sdk/client-rds-data';
import type { Database, Relations, Query } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';

import { validateSchema } from './schema.js';

import { prepareInsert } from './insert.js';
import { prepareUpdate } from './update.js';
import { prepareSelect } from './select.js';
import { prepareDelete } from './delete.js';

export type PreparedQueryCommand = Pick<ExecuteStatementCommandInput, 'sql' | 'parameters'>;

export const prepareInsertOne = async <
  T extends Database.Schema,
  I extends Database.Indexes<T>,
  R extends Relations
>(
  table: string,
  schema: ObjectSchema,
  query: Query.InsertOneInput<T, I, R>
): Promise<PreparedQueryCommand> => {
  await validateSchema(query.data, schema);

  const [statement, variables] = prepareInsert<T, I, R>(table, schema, query);

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
  query: Query.FindOneInput<T, S, I>
): PreparedQueryCommand => {
  const [statement, variables] = prepareSelect<T, I, R, S>(table, schema, {
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

export const prepareUpdateOne = <
  T extends Database.Schema,
  I extends Database.Indexes<T>,
  R extends Relations,
  S extends Query.SelectInput<T, R>
>(
  table: string,
  schema: ObjectSchema,
  query: Query.UpdateOneInput<T, S, I, R>
): PreparedQueryCommand => {
  const [statement, variables] = prepareUpdate<T, I, R, S>(table, schema, {
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
  query: Query.DeleteOneInput<T, S, I>
): PreparedQueryCommand => {
  const [statement, variables] = prepareDelete<T, I, R, S>(table, schema, {
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
  query: Query.InsertManyInput<T>
): Promise<PreparedQueryCommand[]> => {
  return Promise.all(
    query.data.map(async (data) => {
      await validateSchema(data, schema);

      const [statement, variables] = prepareInsert<T, I, R>(table, schema, {
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
  query: Query.FindManyInput<T, S, I>
): PreparedQueryCommand => {
  const [statement, variables] = prepareSelect<T, I, R, S>(table, schema, query);

  return {
    sql: statement,
    ...(variables.length && {
      parameters: variables
    })
  };
};

export const prepareUpdateMany = <
  T extends Database.Schema,
  I extends Database.Indexes<T>,
  R extends Relations,
  S extends Query.SelectInput<T, R>
>(
  table: string,
  schema: ObjectSchema,
  query: Query.UpdateManyInput<T, S>
): PreparedQueryCommand => {
  const [statement, variables] = prepareUpdate<T, I, R, S>(table, schema, query);

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
  query: Query.DeleteManyInput<T, S>
): PreparedQueryCommand => {
  const [statement, variables] = prepareDelete<T, I, R, S>(table, schema, query);

  return {
    sql: statement,
    ...(variables.length && {
      parameters: variables
    })
  };
};
