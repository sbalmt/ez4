import type { TypeClass } from '@ez4/reflection';

import { isTopicServiceDeclaration } from '../metadata/service';
import { isTopicImportDeclaration } from '../metadata/import';

export const getLinkedService = (declaration: TypeClass): string | null => {
  return isTopicServiceDeclaration(declaration) ? declaration.name : null;
};

export const getLinkedImport = (declaration: TypeClass): string | null => {
  return isTopicImportDeclaration(declaration) ? declaration.name : null;
};
