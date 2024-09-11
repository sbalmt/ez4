import type { AllType, TypeCallback, TypeClass, TypeFunction } from '@ez4/reflection';

import { hasHeritageType, isClassDeclaration } from '@ez4/common/library';
import { isTypeCallback, isTypeFunction } from '@ez4/reflection';

export const isCronService = (type: AllType): type is TypeClass => {
  return isClassDeclaration(type) && hasHeritageType(type, 'Cron.Service');
};

export const isCronHandler = (type: AllType): type is TypeCallback | TypeFunction => {
  return isTypeCallback(type) || isTypeFunction(type);
};
