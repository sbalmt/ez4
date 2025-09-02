import type { SqlOperationContext } from './types';

import { SqlSelectStatement } from '../statements/select';
import { InvalidOperandError } from './errors';

export const getExistsOperation = (column: string, operand: unknown, context: SqlOperationContext) => {
  if (!(operand instanceof SqlSelectStatement)) {
    throw new InvalidOperandError(column);
  }

  const [statement, variables] = operand.build();

  context.variables.push(...variables);

  return `EXISTS (${statement})`;
};
