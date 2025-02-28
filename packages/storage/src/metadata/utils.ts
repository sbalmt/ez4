import type { AllType, TypeCallback, TypeClass, TypeFunction, TypeModel } from '@ez4/reflection';

import { hasHeritageType, isClassDeclaration } from '@ez4/common/library';
import { isTypeCallback, isTypeFunction } from '@ez4/reflection';

export const isBucketService = (type: AllType): type is TypeClass => {
  return isClassDeclaration(type) && hasHeritageType(type, 'Bucket.Service');
};

export const isEventHandler = (type: AllType): type is TypeCallback | TypeFunction => {
  return isTypeCallback(type) || isTypeFunction(type);
};

export const isBucketEvent = (type: TypeModel) => {
  return hasHeritageType(type, 'Bucket.Event');
};

export const isBucketCors = (type: TypeModel) => {
  return hasHeritageType(type, 'Bucket.Cors');
};
