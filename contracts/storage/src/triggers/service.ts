import type { TypeClass } from '@ez4/reflection';

import { isBucketService } from '../metadata/utils.js';

export const getLinkedService = (declaration: TypeClass): string | null => {
  return isBucketService(declaration) ? declaration.name : null;
};
