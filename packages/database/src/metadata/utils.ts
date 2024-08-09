import type { AllType, TypeClass, TypeModel } from '@ez4/reflection';

import { hasHeritageType, isClassDeclaration, isModelDeclaration } from '@ez4/common/library';

export const isDatabaseService = (type: AllType): type is TypeClass => {
  return isClassDeclaration(type) && hasHeritageType(type, 'Database.Service');
};

export const isDatabaseTable = (type: AllType): type is TypeModel => {
  return isModelDeclaration(type) && hasHeritageType(type, 'Database.Table');
};

export const isTableSchema = (type: TypeModel) => {
  return hasHeritageType(type, 'Database.Schema');
};
