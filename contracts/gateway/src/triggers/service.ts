import type { TypeClass } from '@ez4/reflection';

import { isHttpImport, isHttpService } from '../metadata/utils';

export const getLinkedService = (declaration: TypeClass): string | null => {
  return isHttpService(declaration) ? declaration.name : null;
};

export const getLinkedImport = (declaration: TypeClass): string | null => {
  return isHttpImport(declaration) ? declaration.name : null;
};
