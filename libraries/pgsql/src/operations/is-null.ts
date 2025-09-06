import type { SqlOperationContext } from './types';

export const getIsNullOperation = (column: string, operand: unknown, context: SqlOperationContext) => {
  if (operand) {
    if (context.parent) {
      return `(${column} IS null OR ${column} = 'null'::jsonb)`;
    }

    return `${column} IS null`;
  }

  if (context.parent) {
    return `(${column} IS NOT null AND ${column} != 'null'::jsonb)`;
  }

  return `${column} IS NOT null`;
};
