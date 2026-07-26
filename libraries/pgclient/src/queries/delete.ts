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
  input: Query.DeleteOneInput<S, T> | Query.DeleteManyInput<S, T>
) => {
  const query = builder.reset().delete(schema).from(table);

  if (input.where) {
    const selectFilter = getSelectFilters(builder, input.where, relations, query, table);

    query.where(selectFilter);
  }

  if (input.select) {
    const selectRecord = getSelectFields(builder, input.select, input.include, schema, relations, query, table);

    query.returning(selectRecord);

    return {
      columns: Object.keys(selectRecord),
      query
    };
  }

  return {
    query
  };
};
