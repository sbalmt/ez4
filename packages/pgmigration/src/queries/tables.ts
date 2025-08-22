import type { PgIndexRepository } from '@ez4/pgclient/library';
import type { ObjectSchema } from '@ez4/schema';
import type { SqlBuilder } from '@ez4/pgsql';

import { Index } from '@ez4/database';

import { getColumnDefault, getColumnType, isOptionalColumn } from '../utils/columns.js';

export namespace TablesQuery {
  export const prepareCreate = (builder: SqlBuilder, table: string, schema: ObjectSchema, indexes: PgIndexRepository) => {
    const statement = builder.table(table).create().missing();

    for (const columnName in schema.properties) {
      const columnSchema = schema.properties[columnName];

      const columnIndexType = indexes[columnName]?.type;
      const columnIsPrimary = columnIndexType === Index.Primary;

      const columnRequired = !isOptionalColumn(columnSchema);
      const columnType = getColumnType(columnSchema, columnIsPrimary);
      const columnValue = getColumnDefault(columnSchema, columnIsPrimary);

      statement.column(columnName, columnType, columnRequired, columnValue).missing();
    }

    return {
      query: statement.build()
    };
  };

  export const prepareRename = (builder: SqlBuilder, fromTable: string, toTable: string) => {
    return {
      query: builder.table(fromTable).rename(toTable).existing().build()
    };
  };

  export const prepareDelete = (builder: SqlBuilder, table: string) => {
    return {
      query: builder.table(table).drop().existing().cascade().build()
    };
  };
}
