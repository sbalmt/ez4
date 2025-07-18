import type { PgIndexRepository } from '@ez4/pgclient/library';
import type { ObjectSchema } from '@ez4/schema';

import { getColumnDefault, getColumnType, isOptionalColumn } from './columns.js';
import { Index } from '@ez4/database';

export const prepareCreateTable = (table: string, schema: ObjectSchema, indexes: PgIndexRepository): string => {
  const allColumnTypes = [];

  for (const columnName in schema.properties) {
    const columnSchema = schema.properties[columnName];

    const columnIndexType = indexes[columnName]?.type;
    const columnIsPrimary = columnIndexType === Index.Primary;

    const columnType = [`"${columnName}"`, getColumnType(columnSchema, columnIsPrimary)];

    if (!isOptionalColumn(columnSchema)) {
      columnType.push('NOT null');
    }

    const columnDefault = getColumnDefault(columnSchema, columnIsPrimary);

    if (columnDefault) {
      columnType.push(`DEFAULT ${columnDefault}`);
    }

    allColumnTypes.push(columnType.join(' '));
  }

  return `CREATE TABLE "${table}" (${allColumnTypes.join(', ')})`;
};

export const prepareDeleteTable = (table: string): string => {
  return `DROP TABLE IF EXISTS "${table}" CASCADE`;
};
