import type { Database, Relations, Query } from '@ez4/database';
import type { SqlParameter } from '@aws-sdk/client-rds-data';
import type { ObjectSchema } from '@ez4/schema';
import type { RepositoryRelationsWithSchema } from '../../types/repository.js';

import { SqlBuilder } from '@ez4/pgsql';

import { detectFieldData, prepareFieldData } from './data.js';
import { getSelectFields } from './select.js';

const Sql = new SqlBuilder({
  onPrepareVariable: (value, index, schema) => {
    if (schema) {
      return prepareFieldData(`${index}`, value, schema);
    }

    return detectFieldData(`${index}`, value);
  }
});

export const prepareDeleteQuery = <
  T extends Database.Schema,
  I extends Database.Indexes<T>,
  R extends Relations,
  S extends Query.SelectInput<T, R>
>(
  table: string,
  schema: ObjectSchema,
  relations: RepositoryRelationsWithSchema,
  query: Query.DeleteOneInput<T, S, I, R> | Query.DeleteManyInput<T, S, R>
): [string, SqlParameter[]] => {
  const deleteQuery = Sql.reset().delete(schema).from(table).where(query.where);

  if (query.select) {
    const selectRecord = getSelectFields(query.select, schema, relations, deleteQuery);

    deleteQuery.returning(selectRecord);
  }

  const [statement, variables] = deleteQuery.build();

  return [statement, variables as SqlParameter[]];
};
