import type { ObjectSchema } from '@ez4/schema';
import type { SqlBuilder } from '@ez4/pgsql';
import type { Query } from '@ez4/database';
import type { PgRelationRepositoryWithSchema } from '../types/repository';
import type { InternalTableMetadata } from '../types/table';

import { getSelectFilters } from './select';

export const prepareExistsQuery = <T extends InternalTableMetadata>(
  builder: SqlBuilder,
  table: string,
  schema: ObjectSchema,
  relations: PgRelationRepositoryWithSchema,
  query: Query.CountInput<T>
) => {
  const existsQuery = builder.select(schema).from(table);

  existsQuery.rawColumn('1 AS "__EZ4_EXISTS"');

  if (query.where) {
    existsQuery.where(getSelectFilters(builder, query.where, relations, existsQuery, table));
  }

  existsQuery.take(1);

  return existsQuery;
};
