import type { AnySchema } from '@ez4/schema';
import type { SqlOperationContext } from './types';

import { getOperandColumn, getOperandFunction, getOperandValue } from './utils';
import { InvalidOperandError } from './errors';

export const getIsBetweenOperation = (column: string, schema: AnySchema | undefined, operand: unknown, context: SqlOperationContext) => {
  if (!Array.isArray(operand)) {
    throw new InvalidOperandError(column);
  }

  const [begin, end] = operand.map((current) => {
    return getOperandValue(schema, current, context);
  });

  const lhsColumn = getOperandColumn(schema, column, context);
  const lhsOperand = context.flags ? getOperandFunction(lhsColumn, context.flags) : lhsColumn;

  return `${lhsOperand} BETWEEN ${begin} AND ${end}`;
};
