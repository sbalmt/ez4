import type { SqlColumnName } from './types.js';

export const escapeName = (name: string) => {
  return `"${name.replaceAll('"', '')}"`;
};

export const escapeText = (name: string) => {
  return `'${name.replaceAll("'", '')}'`;
};

export const mergePath = (column: string, path?: string) => {
  return path ? `${path}[${escapeText(column)}]` : escapeName(column);
};

export const mergeAlias = (column: string, alias?: string) => {
  return alias ? `${escapeName(alias)}.${column}` : column;
};

export const escapeColumn = (column: SqlColumnName) => {
  if (Array.isArray(column)) {
    const columnAlias = escapeName(column[1]);
    const columnName = escapeName(column[0]);

    if (columnName !== columnAlias) {
      return `${columnName} AS ${columnAlias}`;
    }

    return columnName;
  }

  return escapeName(column);
};
