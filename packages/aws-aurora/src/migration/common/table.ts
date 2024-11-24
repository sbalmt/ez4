import type { ObjectSchema } from '@ez4/schema';
import type { RepositoryIndexes } from '../../types/repository.js';

import { getColumnDefault, getColumnType, isNullableColumn } from './column.js';
import { Index } from '@ez4/database';

export const prepareCreateTable = (
  table: string,
  schema: ObjectSchema,
  indexes: RepositoryIndexes
): string => {
  const columnTypes = [];

  for (const columnName in schema.properties) {
    const columnSchema = schema.properties[columnName];
    const columnType = [`"${columnName}"`, getColumnType(columnSchema)];

    const columnNullable = isNullableColumn(columnSchema);

    if (!columnNullable) {
      columnType.push('NOT NULL');
    }

    const columnIndexType = indexes[columnName]?.type;
    const columnDefault = columnIndexType === Index.Primary && getColumnDefault(columnSchema);

    if (columnDefault) {
      columnType.push(`DEFAULT ${columnDefault}`);
    }

    columnTypes.push(columnType.join(' '));
  }

  return `CREATE TABLE "${table}" (${columnTypes.join(', ')})`;
};

export const prepareDeleteTable = (table: string): string => {
  return `DROP TABLE IF EXISTS "${table}" CASCADE`;
};
