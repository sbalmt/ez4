import type { TypeClass } from '@ez4/reflection';

import { isQueueServiceDeclaration } from '../metadata/service';
import { isQueueImportDeclaration } from '../metadata/import';

export const getLinkedService = (declaration: TypeClass): string | null => {
  return isQueueServiceDeclaration(declaration) ? declaration.name : null;
};

export const getLinkedImport = (declaration: TypeClass): string | null => {
  return isQueueImportDeclaration(declaration) ? declaration.name : null;
};
