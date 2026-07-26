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
  const columns = [];

  if (input.where) {
    const filters = getSelectFilters(builder, input.where, relations, query, table);

    query.where(filters);
  }

  if (input.select) {
    const record = getSelectFields(builder, input.select, input.include, schema, relations, query, table);

    columns.push(...Object.keys(input.select));

    query.returning(record);
  }

  return {
    columns,
    query
  };
};
