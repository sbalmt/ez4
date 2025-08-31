import type { TypeClass } from '@ez4/reflection';

import { isCronService } from '../metadata/utils.js';

export const getLinkedService = (declaration: TypeClass): string | null => {
  return isCronService(declaration) ? declaration.name : null;
};
