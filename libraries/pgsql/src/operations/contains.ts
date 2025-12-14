import type { AnySchema } from '@ez4/schema';
import type { SqlOperationContext } from './types';

import { SchemaType } from '@ez4/schema';

import { getOperandColumn, getOperandValue } from './utils';

export const getContainsOperation = (column: string, schema: AnySchema | undefined, operand: unknown, context: SqlOperationContext) => {
  switch (schema?.type) {
    case SchemaType.Object:
    case SchemaType.Array:
    case SchemaType.Tuple: {
      return `${column} @> ${getOperandValue(schema, operand, context, true)}`;
    }

    default: {
      const rhsOperand = getOperandValue(schema, operand, context);
      const lhsOperand = getOperandColumn(schema, column, context);

      if (context.insensitive) {
        return `${lhsOperand} ILIKE '%' || ${rhsOperand} || '%'`;
      }

      return `${lhsOperand} LIKE '%' || ${rhsOperand} || '%'`;
    }
  }
};
