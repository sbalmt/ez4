import type { AllType, TypeClass, TypeModel } from '@ez4/reflection';

import { hasHeritageType, isClassDeclaration } from '@ez4/common/library';

export const isCdnService = (type: AllType): type is TypeClass => {
  return isClassDeclaration(type) && hasHeritageType(type, 'Cdn.Service');
};

export const isCdnOrigin = (type: TypeModel) => {
  return hasHeritageType(type, 'Cdn.Origin');
};
