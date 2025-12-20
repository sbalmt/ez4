import type { AllType, TypeCallback, TypeFunction } from '@ez4/reflection';

import { isTypeCallback, isTypeFunction } from '@ez4/reflection';
import { getFunctionSignature } from '@ez4/common/library';

import { IncompleteHandlerError } from '../errors/handler';

export const isValidationHandlerDeclaration = (type: AllType): type is TypeCallback | TypeFunction => {
  return isTypeCallback(type) || isTypeFunction(type);
};

export const getValidationHandlerMetadata = (type: AllType, errorList: Error[]) => {
  if (!isValidationHandlerDeclaration(type)) {
    return undefined;
  }

  const handler = getFunctionSignature(type);

  if (!handler) {
    errorList.push(new IncompleteHandlerError(type.file));
  }

  return handler;
};
