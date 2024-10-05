import type { AllType, TypeClass, TypeModel } from '@ez4/reflection';

import { hasHeritageType, isClassDeclaration, isModelDeclaration } from '@ez4/common/library';

export const isCdnService = (type: AllType): type is TypeClass => {
  return isClassDeclaration(type) && hasHeritageType(type, 'Cdn.Service');
};

export const isCdnOrigin = (type: TypeModel) => {
  return (
    hasHeritageType(type, 'Cdn.DefaultRegularOrigin') ||
    hasHeritageType(type, 'Cdn.DefaultBucketOrigin') ||
    hasHeritageType(type, 'Cdn.AdditionalRegularOrigin') ||
    hasHeritageType(type, 'Cdn.AdditionalBucketOrigin')
  );
};

export const isCdnFallback = (type: AllType) => {
  return isModelDeclaration(type) && hasHeritageType(type, 'Cdn.Fallback');
};
