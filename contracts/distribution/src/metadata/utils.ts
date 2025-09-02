import type { AllType, TypeClass, TypeModel } from '@ez4/reflection';

import { hasHeritageType, isClassDeclaration, isModelDeclaration } from '@ez4/common/library';

export const isCdnService = (type: AllType): type is TypeClass => {
  return isClassDeclaration(type) && hasHeritageType(type, 'Cdn.Service');
};

export const isCdnCache = (type: TypeModel) => {
  return hasHeritageType(type, 'Cdn.Cache');
};

export const isCdnOrigin = (type: TypeModel) => {
  return (
    hasHeritageType(type, 'Cdn.DefaultRegularOrigin') ||
    hasHeritageType(type, 'Cdn.DefaultBucketOrigin') ||
    hasHeritageType(type, 'Cdn.RegularOrigin') ||
    hasHeritageType(type, 'Cdn.BucketOrigin')
  );
};

export const isCdnFallback = (type: AllType) => {
  return isModelDeclaration(type) && hasHeritageType(type, 'Cdn.Fallback');
};

export const isCdnCertificate = (type: TypeModel) => {
  return hasHeritageType(type, 'Cdn.Certificate');
};
