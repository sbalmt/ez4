import type { TableIndex } from '@ez4/database/library';
import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { ObjectSchema } from '@ez4/schema';
import type { SqlBuilder } from '@ez4/pgsql';
import type { Query } from '@ez4/database';
import type { PgRelationRepositoryWithSchema } from '../types/repository';
import type { InternalTableMetadata } from '../types/table';

import { Order } from '@ez4/database';

import { tryExtractConflictIndex } from '../utils/indexes';
import { getSelectFields, getSelectFilters } from './select';
import { MissingUniqueIndexError } from './errors';
import { getInsertRecord } from './insert';
import { getUpdateRecord } from './update';

export const prepareUpsertQuery = async <T extends InternalTableMetadata, S extends Query.SelectInput<T>>(
  table: string,
  schema: ObjectSchema,
  relations: PgRelationRepositoryWithSchema,
  indexes: TableIndex[],
  query: Query.UpsertOneInput<S, T>,
  builder: SqlBuilder
): Promise<[string, SqlParameter[]]> => {
  const updateRecord = await getUpdateRecord(builder, query.update, schema, relations, table);
  const insertRecord = await getInsertRecord(query.insert, schema, relations, {}, table);

  const conflictIndexes = tryExtractConflictIndex(indexes, query.where);

  if (!conflictIndexes?.columns) {
    throw new MissingUniqueIndexError();
  }

  const insertQuery = builder.insert(schema).record(insertRecord).conflict(conflictIndexes.columns, updateRecord).into(table);

  const allQueries = [];

  if (!query.select) {
    allQueries.push(insertQuery);
  } else {
    const selectQuery = builder
      .select(schema)
      .lock(query.lock ?? false)
      .from(table);

    const selectRecord = getSelectFields(builder, query.select, query.include, schema, relations, selectQuery, table);
    const selectFilter = getSelectFilters(builder, query.where, relations, selectQuery, table);

    selectQuery.record(selectRecord).rawColumn('0 AS "__EZ4_ORDER"').where(selectFilter);
    insertQuery.returning(selectRecord).results.rawColumn('1 AS "__EZ4_ORDER"');

    const resultQuery = builder.select().from(insertQuery.reference()).take(1).order({
      __EZ4_ORDER: Order.Asc
    });

    resultQuery.record(selectRecord).join(selectQuery.reference()).natural().full();

    allQueries.push(selectQuery, insertQuery, resultQuery);
  }

  const [statement, variables] = builder.with(allQueries).build();

  return [statement, variables as SqlParameter[]];
};
