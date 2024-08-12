import type { AllType, TypeCallback, TypeClass, TypeFunction, TypeModel } from '@ez4/reflection';

import { hasHeritageType, isClassDeclaration, isModelDeclaration } from '@ez4/common/library';
import { isTypeCallback, isTypeFunction } from '@ez4/reflection';

export const isDatabaseService = (type: AllType): type is TypeClass => {
  return isClassDeclaration(type) && hasHeritageType(type, 'Database.Service');
};

export const isDatabaseTable = (type: AllType): type is TypeModel => {
  return isModelDeclaration(type) && hasHeritageType(type, 'Database.Table');
};

export const isTableSchema = (type: TypeModel) => {
  return hasHeritageType(type, 'Database.Schema');
};

export const isTableIndexes = (type: TypeModel) => {
  return hasHeritageType(type, 'Database.Indexes');
};

export const isTableStream = (type: AllType): type is TypeModel => {
  return isModelDeclaration(type) && hasHeritageType(type, 'Database.Stream');
};

export const isStreamHandler = (type: AllType): type is TypeCallback | TypeFunction => {
  return isTypeCallback(type) || isTypeFunction(type);
};
