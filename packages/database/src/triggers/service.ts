import type { TypeClass } from '@ez4/reflection';

import { isDatabaseService } from '../metadata/utils.js';

export const getLinkedService = (statement: TypeClass): string | null => {
  if (isDatabaseService(statement)) {
    return statement.name;
  }

  return null;
};
