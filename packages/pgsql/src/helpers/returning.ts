import type { SqlColumnName } from '../types.js';

import { escapeColumn } from '../utils.js';

export const getReturningColumns = (columns: SqlColumnName[]) => {
  return columns.map((column) => escapeColumn(column)).join(', ');
};
