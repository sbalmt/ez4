import type { TypeClass } from '@ez4/reflection';

import { isDatabaseServiceDeclaration } from '../metadata/service';

export const getLinkedService = (declaration: TypeClass): string | null => {
  return isDatabaseServiceDeclaration(declaration) ? declaration.name : null;
};
