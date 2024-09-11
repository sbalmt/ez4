import type { TypeClass } from '@ez4/reflection';

import { isCronService } from './utils.js';

export const getLinkedService = (statement: TypeClass): string | null => {
  if (isCronService(statement)) {
    return statement.name;
  }

  return null;
};
