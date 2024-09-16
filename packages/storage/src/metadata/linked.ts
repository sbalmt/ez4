import type { TypeClass } from '@ez4/reflection';

import { isBucketService } from './utils.js';

export const getLinkedService = (statement: TypeClass): string | null => {
  if (isBucketService(statement)) {
    return statement.name;
  }

  return null;
};
