import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { ObjectSchema } from '@ez4/schema';
import type { SqlBuilder } from '@ez4/pgsql';
import type { Query } from '@ez4/database';
import type { PgRelationRepositoryWithSchema } from '../types/repository.js';
import type { InternalTableMetadata } from '../types/table.js';

import { getSelectFilters } from './select.js';

export const prepareCountQuery = <T extends InternalTableMetadata>(
  table: string,
  schema: ObjectSchema,
  relations: PgRelationRepositoryWithSchema,
  query: Query.CountInput<T>,
  builder: SqlBuilder
): [string, SqlParameter[]] => {
  const selectQuery = builder.select(schema).from(table);

  selectQuery.rawColumn('COUNT(1) AS "count"');

  if (query.where) {
    const selectFilters = getSelectFilters(builder, query.where, relations, selectQuery, table);

    selectQuery.where(selectFilters);
  }

  const [statement, variables] = selectQuery.build();

  return [statement, variables as SqlParameter[]];
};
