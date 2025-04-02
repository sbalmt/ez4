import type { Database, RelationMetadata, Query } from '@ez4/database';
import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { ObjectSchema } from '@ez4/schema';
import type { RepositoryRelationsWithSchema } from '../../types/repository.js';

import { createQueryBuilder } from './builder.js';
import { getSelectFilters } from './select.js';

export const prepareCountQuery = <T extends Database.Schema, R extends RelationMetadata>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.CountInput<T, R>
): [string, SqlParameter[]] => {
  const sql = createQueryBuilder();

  const selectQuery = sql.select(schema).from(table);

  selectQuery.rawColumn('COUNT(1) AS "count"');

  if (query.where) {
    const selectFilters = getSelectFilters(sql, query.where, relations, selectQuery);

    selectQuery.where(selectFilters);
  }

  const [statement, variables] = selectQuery.build();

  return [statement, variables as SqlParameter[]];
};
