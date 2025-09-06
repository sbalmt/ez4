import type { ObjectSchema } from '@ez4/schema';
import type { SqlBuilder } from '@ez4/pgsql';
import type { Query } from '@ez4/database';
import type { PgRelationRepositoryWithSchema } from '../types/repository';
import type { InternalTableMetadata } from '../types/table';

import { getSelectFilters, getSelectFields } from './select';

export const prepareDeleteQuery = <T extends InternalTableMetadata, S extends Query.SelectInput<T>>(
  builder: SqlBuilder,
  table: string,
  schema: ObjectSchema,
  relations: PgRelationRepositoryWithSchema,
  query: Query.DeleteOneInput<S, T> | Query.DeleteManyInput<S, T>
) => {
  const deleteQuery = builder.reset().delete(schema).from(table);

  if (query.where) {
    const selectFilter = getSelectFilters(builder, query.where, relations, deleteQuery, table);

    deleteQuery.where(selectFilter);
  }

  if (query.select) {
    const selectRecord = getSelectFields(builder, query.select, query.include, schema, relations, deleteQuery, table);

    deleteQuery.returning(selectRecord);
  }

  return deleteQuery;
};
