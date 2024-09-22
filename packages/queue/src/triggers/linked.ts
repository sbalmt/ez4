import type { TypeClass } from '@ez4/reflection';

import { isQueueService, isQueueImport } from '../metadata/utils.js';

export const getLinkedService = (statement: TypeClass): string | null => {
  return isQueueService(statement) ? statement.name : null;
};

export const getLinkedImport = (statement: TypeClass): string | null => {
  return isQueueImport(statement) ? statement.name : null;
};
