import type { SqlOperationContext } from './types.js';

import { SqlSelectStatement } from '../statements/select.js';
import { InvalidOperandError } from '../errors/operation.js';

export const getExistsOperation = (column: string, operand: unknown, context: SqlOperationContext) => {
  if (!(operand instanceof SqlSelectStatement)) {
    throw new InvalidOperandError(column);
  }

  const [statement, variables] = operand.build();

  context.variables.push(...variables);

  return `EXISTS (${statement})`;
};
