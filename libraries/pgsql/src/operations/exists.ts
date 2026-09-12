import type { SqlOperationContext } from './types';

import { InvalidOperandError } from '../errors/operations';
import { SqlSelectStatement } from '../statements/select';

export const getExistsOperation = (column: string, operand: unknown, context: SqlOperationContext) => {
  if (!(operand instanceof SqlSelectStatement)) {
    throw new InvalidOperandError(column);
  }

  const [statement, variables] = operand.build();

  context.variables.push(...variables);

  return `EXISTS (${statement})`;
};
