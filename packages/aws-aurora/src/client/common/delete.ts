import type { Database, Relations, Query } from '@ez4/database';
import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { ObjectSchema } from '@ez4/schema';
import type { RepositoryRelationsWithSchema } from '../../types/repository.js';

import { SqlBuilder } from '@ez4/pgsql';

import { getSelectFields } from './select.js';
import { detectFieldData } from './data.js';

const Sql = new SqlBuilder();

export const prepareDeleteQuery = <
  T extends Database.Schema,
  I extends Database.Indexes<T>,
  R extends Relations,
  S extends Query.SelectInput<T, R>
>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.DeleteOneInput<T, S, I, R> | Query.DeleteManyInput<T, S, R>
): [string, SqlParameter[]] => {
  const deleteQuery = Sql.reset().delete(table).where(query.where);

  if (query.select) {
    deleteQuery.returning(getSelectFields(query.select, schema, relations, deleteQuery));
  }

  const [statement, variables] = deleteQuery.build();

  const parameters = variables.map((current, index) => {
    return detectFieldData(index.toString(), current);
  });

  return [statement, parameters];
};
