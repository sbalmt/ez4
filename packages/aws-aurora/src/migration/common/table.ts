import type { AnySchema, ObjectSchema } from '@ez4/schema';

import { getColumnDefault, getColumnType, isNullableColumn } from './column.js';

export const prepareCreateTable = (table: string, schema: ObjectSchema): string => {
  const columnTypes = [];

  for (const columnName in schema.properties) {
    const columnSchema = schema.properties[columnName];
    const columnType = [`"${columnName}"`, getColumnType(columnSchema)];

    const isNullable = isNullableColumn(columnSchema);

    if (isNullable) {
      const columnDefault = getColumnDefault(columnSchema);

      if (columnDefault) {
        columnType.push(`DEFAULT ${columnDefault}`);
      }
    }

    if (!isNullable) {
      columnType.push('NOT NULL');
    }

    columnTypes.push(columnType.join(' '));
  }

  return `CREATE TABLE "${table}" (${columnTypes.join(', ')})`;
};

export const prepareUpdateTable = (
  table: string,
  toCreate: Record<string, AnySchema>,
  toUpdate: Record<string, AnySchema>,
  toRemove: Record<string, AnySchema>
) => {
  const alterTable = `ALTER TABLE "${table}"`;

  const statements = [];

  for (const columnName in toRemove) {
    statements.push(`${alterTable} DROP COLUMN "${columnName}"`);
  }

  for (const columnName in toUpdate) {
    const alterColumn = `${alterTable} ALTER COLUMN "${columnName}"`;

    const columnSchema = toUpdate[columnName];
    const columnDefault = getColumnDefault(columnSchema);
    const columnType = getColumnType(columnSchema);

    statements.push(`${alterColumn} TYPE ${columnType}`);

    if (isNullableColumn(columnSchema)) {
      statements.push(`${alterColumn} DROP NOT NULL`);
    } else {
      statements.push(`${alterColumn} SET NOT NULL`);
    }

    if (columnDefault) {
      statements.push(`${alterColumn} SET DEFAULT ${columnDefault}`);
    } else {
      statements.push(`${alterColumn} DROP DEFAULT`);
    }
  }

  for (const columnName in toCreate) {
    const columnSchema = toCreate[columnName];

    const columnType = getColumnType(columnSchema);

    statements.push(`${alterTable} ADD COLUMN "${columnName}" ${columnType}`);
  }

  return statements;
};

export const prepareDeleteTable = (table: string): string => {
  return `DROP TABLE "${table}"`;
};