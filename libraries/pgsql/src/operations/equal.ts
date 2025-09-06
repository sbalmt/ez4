import type { AnySchema } from '@ez4/schema';
import type { SqlOperationContext } from './types';

import { getOperandColumn, getOperandValue } from './utils';

export const getEqualOperation = (column: string, schema: AnySchema | undefined, operand: unknown, context: SqlOperationContext) => {
  const lhsOperand = getOperandColumn(schema, column, context);

  if (operand === null && !context.parent) {
    return `${lhsOperand} IS NULL`;
  }

  const rhsOperand = getOperandValue(schema, operand, context);

  if (context.insensitive) {
    return `LOWER(${lhsOperand}) = LOWER(${rhsOperand})`;
  }

  return `${lhsOperand} = ${rhsOperand}`;
};
