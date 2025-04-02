import type { Database, RelationMetadata, Query } from '@ez4/database';
import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { ObjectSchema } from '@ez4/schema';
import type { RepositoryRelationsWithSchema } from '../../types/repository.js';

import { getSelectFilters, getSelectFields } from './select.js';
import { createQueryBuilder } from './builder.js';

export const prepareDeleteQuery = <
  T extends Database.Schema,
  S extends Query.SelectInput<T, R>,
  I extends Database.Indexes,
  R extends RelationMetadata
>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.DeleteOneInput<T, S, I, R> | Query.DeleteManyInput<T, S, R>
): [string, SqlParameter[]] => {
  const sql = createQueryBuilder();

  const deleteQuery = sql.reset().delete(schema).from(table);

  if (query.where) {
    const selectFilters = getSelectFilters(sql, query.where, relations, deleteQuery);

    deleteQuery.where(selectFilters);
  }

  if (query.select) {
    const selectRecord = getSelectFields(sql, query.select, query.include, schema, relations, deleteQuery, table);

    deleteQuery.returning(selectRecord);
  }

  const [statement, variables] = deleteQuery.build();

  return [statement, variables as SqlParameter[]];
};
