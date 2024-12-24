import type { SqlColumnName } from './types.js';

export const escapeName = (name: string) => {
  return `"${name.replaceAll('"', '')}"`;
};

export const escapeColumn = (column: SqlColumnName) => {
  if (Array.isArray(column)) {
    const columnAlias = escapeName(column[1]);
    const columnName = escapeName(column[0]);

    return `${columnName} AS ${columnAlias}`;
  }

  return escapeName(column);
};
