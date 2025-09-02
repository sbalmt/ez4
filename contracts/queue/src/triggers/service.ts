import type { TypeClass } from '@ez4/reflection';

import { isQueueService, isQueueImport } from '../metadata/utils';

export const getLinkedService = (declaration: TypeClass): string | null => {
  return isQueueService(declaration) ? declaration.name : null;
};

export const getLinkedImport = (declaration: TypeClass): string | null => {
  return isQueueImport(declaration) ? declaration.name : null;
};
