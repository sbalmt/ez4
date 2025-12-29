import type { TypeClass } from '@ez4/reflection';

import { isBucketServiceDeclaration } from '../metadata/service';

export const getLinkedService = (declaration: TypeClass): string | null => {
  return isBucketServiceDeclaration(declaration) ? declaration.name : null;
};
