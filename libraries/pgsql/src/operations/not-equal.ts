import type { AnySchema } from '@ez4/schema';
import type { SqlOperationContext } from './types';

import { getOperandFunction, getOperandColumn, getOperandValue } from './utils';
import { getIsNullOperation } from './is-null';

export const getNotEqualOperation = (column: string, schema: AnySchema | undefined, operand: unknown, context: SqlOperationContext) => {
  if (operand === null) {
    return getIsNullOperation(column, false);
  }

  const lhsColumn = getOperandColumn(schema, column, context);
  const rhsValue = getOperandValue(schema, operand, context);

  const lhsOperand = context.flags ? getOperandFunction(lhsColumn, context.flags) : lhsColumn;
  const rhsOperand = context.flags?.insensitive ? getOperandFunction(rhsValue, context.flags) : rhsValue;

  return `${lhsOperand} != ${rhsOperand}`;
};
