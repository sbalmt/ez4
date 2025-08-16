import type { AnySchema } from '@ez4/schema';
import type { SqlOperationContext } from './types.js';

import { getOperandColumn, getOperandValue } from './utils.js';
import { InvalidOperandError } from './errors.js';

export const getIsBetweenOperation = (column: string, schema: AnySchema | undefined, operand: unknown, context: SqlOperationContext) => {
  if (!Array.isArray(operand)) {
    throw new InvalidOperandError(column);
  }

  const [begin, end] = operand.map((current) => {
    return getOperandValue(schema, current, context);
  });

  const lhsOperand = getOperandColumn(schema, column, context);

  return `${lhsOperand} BETWEEN ${begin} AND ${end}`;
};
