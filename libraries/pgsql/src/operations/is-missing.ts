import type { SqlOperationContext } from './types';

import { escapeSqlText } from '../utils/escape';
import { getIsNullOperation } from './is-null';

export const getIsMissingOperation = (column: string, operand: unknown, context: SqlOperationContext) => {
  if (!context.path || !context.field) {
    return getIsNullOperation(column, operand);
  }

  if (operand) {
    return `NOT (${context.path} ? ${escapeSqlText(context.field)})`;
  }

  return `${context.path} ? ${escapeSqlText(context.field)}`;
};
