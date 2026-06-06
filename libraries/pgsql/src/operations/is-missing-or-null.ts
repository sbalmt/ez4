import type { SqlOperationContext } from './types';

import { escapeSqlText } from '../utils/escape';
import { getIsNullOperation } from './is-null';

export const getIsMissingOrNullOperation = (column: string, operand: unknown, context: SqlOperationContext) => {
  if (!context.path || !context.field) {
    return getIsNullOperation(column, operand);
  }

  const hasKey = `${context.path} ? ${escapeSqlText(context.field)}`;

  if (operand) {
    return `(NOT (${hasKey}) OR ${column} IS null)`;
  }

  return `(${hasKey} AND ${column} IS NOT null)`;
};
