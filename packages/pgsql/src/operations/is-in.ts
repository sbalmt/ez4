import type { AnySchema } from '@ez4/schema';
import type { SqlOperationContext } from './types.js';

import { SchemaType } from '@ez4/schema';

import { getOperandColumn, getOperandValue } from './utils.js';
import { InvalidOperandError } from '../errors/operation.js';

export const getIsInOperation = (column: string, schema: AnySchema | undefined, operand: unknown, context: SqlOperationContext) => {
  switch (schema?.type) {
    case SchemaType.Object:
    case SchemaType.Array:
    case SchemaType.Tuple:
      return `${column} <@ ${getOperandValue(schema, operand, context, true)}`;

    default:
      if (!Array.isArray(operand)) {
        throw new InvalidOperandError(column);
      }

      if (!operand.length) {
        return 'false';
      }

      const rhsOperand = operand.map((current) => {
        return getOperandValue(schema, current, context);
      });

      const lhsOperand = getOperandColumn(schema, column, context);

      return `${lhsOperand} IN (${rhsOperand.join(', ')})`;
  }
};
