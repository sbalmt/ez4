import type { TypeClass } from '@ez4/reflection';

import { isNotificationService, isNotificationImport } from '../metadata/utils.js';

export const getLinkedService = (statement: TypeClass): string | null => {
  return isNotificationService(statement) ? statement.name : null;
};

export const getLinkedImport = (statement: TypeClass): string | null => {
  return isNotificationImport(statement) ? statement.name : null;
};
