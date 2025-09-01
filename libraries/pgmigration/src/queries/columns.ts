import type { PgIndexRepository } from '@ez4/pgclient/library';
import type { AnySchema, ObjectSchema } from '@ez4/schema';
import type { ObjectComparison } from '@ez4/utils';
import type { SqlBuilder } from '@ez4/pgsql';

import { Index } from '@ez4/database';

import { getColumnDefault, getColumnType, isOptionalColumn } from '../utils/columns';
import { getCheckColumnQuery } from '../utils/checks';

export namespace ColumnQuery {
  export const prepareCreate = (builder: SqlBuilder, table: string, indexes: PgIndexRepository, columns: Record<string, AnySchema>) => {
    const statement = builder.table(table).alter().existing();

    for (const columnName in columns) {
      const columnSchema = columns[columnName];

      const columnIndexType = indexes[columnName]?.type;
      const columnIsPrimary = columnIndexType === Index.Primary;

      const columnRequired = !isOptionalColumn(columnSchema);
      const columnType = getColumnType(columnSchema, columnIsPrimary);
      const columnValue = getColumnDefault(columnSchema, columnIsPrimary);

      statement.add(columnName, columnType, columnRequired, columnValue).missing();
    }

    return {
      query: statement.build()
    };
  };

  export const prepareUpdate = (
    builder: SqlBuilder,
    table: string,
    schema: ObjectSchema,
    indexes: PgIndexRepository,
    changes: Record<string, ObjectComparison>
  ) => {
    const statements = [];

    for (const columnName in changes) {
      const { update, nested } = changes[columnName];

      const columnSchema = schema.properties[columnName];

      const columnIndexType = indexes[columnName]?.type;
      const columnIsPrimary = columnIndexType === Index.Primary;

      const columnDefault = nested?.definitions?.update?.default;
      const columnOptional = update?.optional ?? update?.nullable;
      const columnType = update?.type;

      const query = builder.table(table).alter().existing().column(columnName);

      if (columnType !== undefined) {
        query.type(getColumnType(columnSchema, columnIsPrimary));
      }

      if (columnOptional !== undefined) {
        query.optional(columnOptional);
      }

      if (columnDefault !== undefined) {
        query.default(getColumnDefault(columnSchema, columnIsPrimary));
      }

      if (query.empty) {
        continue;
      }

      statements.push({
        check: getCheckColumnQuery(builder, table, columnName),
        query: query.build()
      });
    }

    return statements;
  };

  export const prepareRename = (builder: SqlBuilder, table: string, changes: Record<string, string>) => {
    const statements = [];

    for (const fromColumn in changes) {
      const toColum = changes[fromColumn];

      const statement = builder.table(table).alter().existing().rename(fromColumn, toColum);

      statements.push({
        check: getCheckColumnQuery(builder, table, fromColumn),
        query: statement.build()
      });
    }

    return statements;
  };

  export const prepareDelete = (builder: SqlBuilder, table: string, columns: Record<string, AnySchema>) => {
    const statement = builder.table(table).alter().existing();

    for (const columnName in columns) {
      statement.drop(columnName).existing();
    }

    return {
      query: statement.build()
    };
  };
}
