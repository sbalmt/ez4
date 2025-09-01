import type { TypeClass } from '@ez4/reflection';

import { isTopicService, isTopicImport } from '../metadata/utils';

export const getLinkedService = (declaration: TypeClass): string | null => {
  return isTopicService(declaration) ? declaration.name : null;
};

export const getLinkedImport = (declaration: TypeClass): string | null => {
  return isTopicImport(declaration) ? declaration.name : null;
};
