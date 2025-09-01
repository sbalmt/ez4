import type { TypeClass } from '@ez4/reflection';

import { isDatabaseService } from '../metadata/utils';

export const getLinkedService = (declaration: TypeClass): string | null => {
  return isDatabaseService(declaration) ? declaration.name : null;
};
