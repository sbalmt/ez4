import type { AllType, TypeClass } from '@ez4/reflection';

import { hasHeritageType, isClassDeclaration } from '@ez4/common/library';

export const isCdnService = (type: AllType): type is TypeClass => {
  return isClassDeclaration(type) && hasHeritageType(type, 'Cdn.Service');
};
