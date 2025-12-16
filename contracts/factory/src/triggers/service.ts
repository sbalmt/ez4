import type { TypeClass } from '@ez4/reflection';

import { isFactoryServiceDeclaration } from '../metadata/service';

export const getLinkedService = (declaration: TypeClass): string | null => {
  return isFactoryServiceDeclaration(declaration) ? declaration.name : null;
};
