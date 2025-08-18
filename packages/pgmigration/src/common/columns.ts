import type { PgIndexRepository } from '@ez4/pgclient/library';
import type { AnySchema, ObjectSchema } from '@ez4/schema';
import type { ObjectComparison } from '@ez4/utils';
import type { SqlBuilder } from '@ez4/pgsql';

import { Index } from '@ez4/database';
import { getColumnDefault, getColumnType, isOptionalColumn } from '../utils/columns.js';

export const prepareCreateColumns = (
  builder: SqlBuilder,
  table: string,
  indexes: PgIndexRepository,
  columns: Record<string, AnySchema>
) => {
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

export const prepareUpdateColumns = (
  builder: SqlBuilder,
  table: string,
  schema: ObjectSchema,
  indexes: PgIndexRepository,
  updates: Record<string, ObjectComparison>
) => {
  const statement = builder.table(table).alter().existing();

  for (const columnName in updates) {
    const { update } = updates[columnName];

    const columnSchema = schema.properties[columnName];
    const columnIndexType = indexes[columnName]?.type;
    const columnIsPrimary = columnIndexType === Index.Primary;

    const clause = statement.column(columnName);

    if (update) {
      const columnRequired = update.optional ?? update.nullable;
      const columnDefault = update.definitions?.default;

      if (update.type) {
        clause.type(getColumnType(columnSchema, columnIsPrimary));
      }

      if (columnRequired !== undefined) {
        clause.required(columnRequired);
      }

      if (columnDefault !== undefined) {
        clause.default(getColumnDefault(columnSchema, columnIsPrimary));
      }
    }
  }

  return {
    query: statement.build()
  };
};

export const prepareRenameColumns = (builder: SqlBuilder, table: string, columns: Record<string, string>) => {
  const statements = [];

  for (const fromColumn in columns) {
    const toColum = columns[fromColumn];

    const statement = builder.table(table).alter().existing().rename(fromColumn, toColum);

    statements.push({
      query: statement.build()
    });
  }

  return statements;
};

export const prepareDeleteColumns = (builder: SqlBuilder, table: string, columns: Record<string, AnySchema>) => {
  const statement = builder.table(table).alter().existing();

  for (const columnName in columns) {
    statement.drop(columnName).existing();
  }

  return {
    query: statement.build()
  };
};
