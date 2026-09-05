import type { AnySchema } from '@ez4/schema';
import type { SqlOperationContext } from './types';

import { getOperandColumn, getOperandFunction, getOperandValue } from './utils';

export const getGreaterOrEqualOperation = (
  column: string,
  schema: AnySchema | undefined,
  operand: unknown,
  context: SqlOperationContext
) => {
  const lhsColumn = getOperandColumn(schema, column, context);

  const lhsOperand = context.flags ? getOperandFunction(lhsColumn, context.flags) : lhsColumn;
  const rhsOperand = getOperandValue(schema, operand, context);

  return `${lhsOperand} >= ${rhsOperand}`;
};
