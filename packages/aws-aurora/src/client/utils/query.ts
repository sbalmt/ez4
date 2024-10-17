import type { ExecuteStatementCommandInput } from '@aws-sdk/client-rds-data';
import type { Database, Query } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';

import { validateSchema } from '../utils/schema.js';

import { prepareInsert } from '../query/insert.js';
import { prepareUpdate } from '../query/update.js';
import { prepareSelect } from '../query/select.js';
import { prepareDelete } from '../query/delete.js';

export type PreparedQueryCommand = Pick<ExecuteStatementCommandInput, 'sql' | 'parameters'>;

export const prepareInsertOne = async <T extends Database.Schema>(
  table: string,
  schema: ObjectSchema,
  query: Query.InsertOneInput<T>
): Promise<PreparedQueryCommand> => {
  await validateSchema(query.data, schema);

  const [statement, variables] = prepareInsert(table, schema, query);

  return {
    sql: statement,
    parameters: variables
  };
};

export const prepareFindOne = <T extends Database.Schema, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  query: Query.FindOneInput<T, S, never>
): PreparedQueryCommand => {
  return prepareFindMany(table, schema, {
    ...query,
    limit: 1
  });
};

export const prepareUpdateOne = <T extends Database.Schema, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  query: Query.UpdateOneInput<T, S, never>
): PreparedQueryCommand => {
  return prepareUpdateMany(table, schema, {
    ...query,
    limit: 1
  });
};

export const prepareDeleteOne = <T extends Database.Schema, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  query: Query.DeleteOneInput<T, S, never>
): PreparedQueryCommand => {
  return prepareDeleteMany(table, schema, {
    ...query,
    limit: 1
  });
};

export const prepareInsertMany = async <T extends Database.Schema>(
  table: string,
  schema: ObjectSchema,
  query: Query.InsertManyInput<T>
): Promise<PreparedQueryCommand[]> => {
  return Promise.all(
    query.data.map(async (data) => {
      await validateSchema(data, schema);

      const [statement, variables] = prepareInsert(table, schema, {
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

export const prepareFindMany = <T extends Database.Schema, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  query: Query.FindManyInput<T, S>
): PreparedQueryCommand => {
  const [statement, variables] = prepareSelect(table, schema, query);

  return {
    sql: statement,
    ...(variables.length && {
      parameters: variables
    })
  };
};

export const prepareUpdateMany = <T extends Database.Schema, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  query: Query.UpdateManyInput<T, S>
): PreparedQueryCommand => {
  const [statement, variables] = prepareUpdate(table, schema, query);

  return {
    sql: statement,
    ...(variables.length && {
      parameters: variables
    })
  };
};

export const prepareDeleteMany = <T extends Database.Schema, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  query: Query.DeleteManyInput<T, S>
): PreparedQueryCommand => {
  const [statement, variables] = prepareDelete(table, schema, query);

  return {
    sql: statement,
    ...(variables.length && {
      parameters: variables
    })
  };
};
