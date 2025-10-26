import type { TypeClass } from '@ez4/reflection';

import { isHttpService } from '../metadata/utils';

export const getLinkedService = (declaration: TypeClass): string | null => {
  return isHttpService(declaration) ? declaration.name : null;
};
