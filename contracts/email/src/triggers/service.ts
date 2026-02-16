import type { TypeClass } from '@ez4/reflection';

import { isEmailServiceDeclaration } from '../metadata/service';

export const getLinkedService = (declaration: TypeClass): string | null => {
  return isEmailServiceDeclaration(declaration) ? declaration.name : null;
};
