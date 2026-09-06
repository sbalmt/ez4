import type { AnySchema } from '@ez4/schema';
import type { SqlOperationContext } from './types';

import { InvalidOperandError } from '../errors/operations';
import { getOperandColumn, getOperandFunction, getOperandValue } from './utils';

export const getIsBetweenOperation = (column: string, schema: AnySchema | undefined, operand: unknown, context: SqlOperationContext) => {
  if (!Array.isArray(operand) || operand.length !== 2) {
    throw new InvalidOperandError(column);
  }

  const [begin, end] = operand.map((current) => {
    return getOperandValue(schema, current, context);
  });

  const lhsColumn = getOperandColumn(schema, column, context);
  const lhsOperand = context.flags ? getOperandFunction(lhsColumn, context.flags) : lhsColumn;

  return `${lhsOperand} BETWEEN ${begin} AND ${end}`;
};
