import type { TypeClass } from '@ez4/reflection';

import { isNotificationService, isNotificationImport } from '../metadata/utils.js';

export const getLinkedService = (declaration: TypeClass): string | null => {
  return isNotificationService(declaration) ? declaration.name : null;
};

export const getLinkedImport = (declaration: TypeClass): string | null => {
  return isNotificationImport(declaration) ? declaration.name : null;
};
