import type { TypeClass } from '@ez4/reflection';

import { isCronServiceDeclaration } from '../metadata/service';

export const getLinkedService = (declaration: TypeClass): string | null => {
  return isCronServiceDeclaration(declaration) ? declaration.name : null;
};
