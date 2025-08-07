import type { AnySchema } from '@ez4/schema';
import type { SqlOperationContext } from './types.js';

import { getOperandColumn, getOperandValue } from './utils.js';

export const getNotEqualOperation = (column: string, schema: AnySchema | undefined, operand: unknown, context: SqlOperationContext) => {
  const rhsOperand = getOperandValue(schema, operand, context);
  const lhsOperand = getOperandColumn(schema, column, context);

  return `${lhsOperand} != ${rhsOperand}`;
};
