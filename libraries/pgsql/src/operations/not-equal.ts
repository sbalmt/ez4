import type { AnySchema } from '@ez4/schema';
import type { SqlOperationContext } from './types';

import { getOperandColumn, getOperandValue } from './utils';

export const getNotEqualOperation = (column: string, schema: AnySchema | undefined, operand: unknown, context: SqlOperationContext) => {
  const rhsOperand = getOperandValue(schema, operand, context);
  const lhsOperand = getOperandColumn(schema, column, context);

  if (context.insensitive) {
    return `LOWER(${lhsOperand}) != LOWER(${rhsOperand})`;
  }

  return `${lhsOperand} != ${rhsOperand}`;
};
