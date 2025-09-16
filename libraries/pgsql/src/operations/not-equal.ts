import type { AnySchema } from '@ez4/schema';
import type { SqlOperationContext } from './types';

import { getOperandColumn, getOperandValue } from './utils';
import { getIsNullOperation } from './is-null';

export const getNotEqualOperation = (column: string, schema: AnySchema | undefined, operand: unknown, context: SqlOperationContext) => {
  if (operand === null) {
    return getIsNullOperation(column, false);
  }

  const lhsOperand = getOperandColumn(schema, column, context);
  const rhsOperand = getOperandValue(schema, operand, context);

  if (context.insensitive) {
    return `LOWER(${lhsOperand}) != LOWER(${rhsOperand})`;
  }

  return `${lhsOperand} != ${rhsOperand}`;
};
