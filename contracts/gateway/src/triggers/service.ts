import type { TypeClass } from '@ez4/reflection';

import { isWsServiceDeclaration } from '../metadata/ws/service';
import { isHttpServiceDeclaration } from '../metadata/http/service';
import { isHttpImportDeclaration } from '../metadata/http/import';

export const getLinkedService = (declaration: TypeClass): string | null => {
  return isHttpServiceDeclaration(declaration) || isWsServiceDeclaration(declaration) ? declaration.name : null;
};

export const getLinkedImport = (declaration: TypeClass): string | null => {
  return isHttpImportDeclaration(declaration) ? declaration.name : null;
};
