import type { ObjectSchema } from '@ez4/schema';
import type { SqlBuilder } from '@ez4/pgsql';
import type { Query } from '@ez4/database';
import type { PgRelationRepositoryWithSchema } from '../types/repository';
import type { InternalTableMetadata } from '../types/table';

import { getSelectFilters } from './select';

export const prepareCountQuery = <T extends InternalTableMetadata>(
  table: string,
  schema: ObjectSchema,
  relations: PgRelationRepositoryWithSchema,
  query: Query.CountInput<T>,
  builder: SqlBuilder
) => {
  const countQuery = builder.select(schema).from(table);

  countQuery.rawColumn('COUNT(1) AS "__EZ4_COUNT"');

  if (query.where) {
    const selectFilters = getSelectFilters(builder, query.where, relations, countQuery, table);

    countQuery.where(selectFilters);
  }

  return countQuery;
};
