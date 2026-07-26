import type { ObjectSchema } from '@ez4/schema';
import type { SqlBuilder } from '@ez4/pgsql';
import type { Query } from '@ez4/database';
import type { PgRelationRepositoryWithSchema } from '../types/repository';
import type { InternalTableMetadata } from '../types/table';

import { getSelectFilters } from './select';

const RAW_COLUMN_NAME = '__EZ4_EXISTS';

export const prepareExistsQuery = <T extends InternalTableMetadata>(
  builder: SqlBuilder,
  table: string,
  schema: ObjectSchema,
  relations: PgRelationRepositoryWithSchema,
  input: Query.CountInput<T>
) => {
  const query = builder.select(schema).from(table);

  query.rawColumn(1, RAW_COLUMN_NAME);

  if (input.where) {
    query.where(getSelectFilters(builder, input.where, relations, query, table));
  }

  query.take(1);

  return {
    columns: [RAW_COLUMN_NAME],
    query
  };
};
