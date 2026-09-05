import type { AnySchema } from '@ez4/schema';
import type { SqlOperationContext } from './types';

import { isAnyArray, isEmptyArray } from '@ez4/utils';
import { SchemaType } from '@ez4/schema';

import { getOperandColumn, getOperandFunction, getOperandValue } from './utils';
import { InvalidOperandError } from './errors';

export const getIsInOperation = (column: string, schema: AnySchema | undefined, operand: unknown, context: SqlOperationContext) => {
  if (!isAnyArray(operand)) {
    throw new InvalidOperandError(column);
  }

  if (isEmptyArray(operand)) {
    return 'false';
  }

  const lhsColumn = getOperandColumn(schema, column, context);

  switch (schema?.type) {
    case SchemaType.Object:
    case SchemaType.Array:
    case SchemaType.Tuple: {
      const rhsOperands = operand.map((current) => getOperandValue(schema, current, context, true));

      return `(${rhsOperands.map((rhsOperand) => `${lhsColumn} <@ ${rhsOperand}`).join(' OR ')})`;
    }

    default: {
      const lhsOperand = context.flags ? getOperandFunction(lhsColumn, context.flags) : lhsColumn;
      const rhsOperands = operand.map((current) => getOperandValue(schema, current, context));

      return `${lhsOperand} IN (${rhsOperands.join(', ')})`;
    }
  }
};
