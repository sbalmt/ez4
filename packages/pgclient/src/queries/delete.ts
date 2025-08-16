import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { ObjectSchema } from '@ez4/schema';
import type { SqlBuilder } from '@ez4/pgsql';
import type { Query } from '@ez4/database';
import type { RepositoryRelationsWithSchema } from '../types/repository.js';
import type { InternalTableMetadata } from '../types/table.js';

import { getSelectFilters, getSelectFields } from './select.js';

export const prepareDeleteQuery = <T extends InternalTableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.DeleteOneInput<S, T> | Query.DeleteManyInput<S, T>,
  builder: SqlBuilder
): [string, SqlParameter[]] => {
  const deleteQuery = builder.reset().delete(schema).from(table);

  if (query.where) {
    const selectFilters = getSelectFilters(builder, query.where, relations, deleteQuery);

    deleteQuery.where(selectFilters);
  }

  if (query.select) {
    const selectRecord = getSelectFields(builder, query.select, query.include, schema, relations, deleteQuery, table);

    deleteQuery.returning(selectRecord);
  }

  const [statement, variables] = deleteQuery.build();

  return [statement, variables as SqlParameter[]];
};
