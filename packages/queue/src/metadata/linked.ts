import type { TypeClass } from '@ez4/reflection';

import { isQueueService } from './utils.js';

export const getLinkedService = (statement: TypeClass): string | null => {
  if (isQueueService(statement)) {
    return statement.name;
  }

  return null;
};
