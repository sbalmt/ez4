import type { TypeClass } from '@ez4/reflection';

import { isCacheServiceDeclaration } from '../metadata/service';

export const getLinkedService = (declaration: TypeClass): string | null => {
  return isCacheServiceDeclaration(declaration) ? declaration.name : null;
};
