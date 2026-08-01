import type { AllType, TypeCallback, TypeFunction } from '@ez4/reflection';

import { getFunctionReferences, getFunctionSignature } from '@ez4/common/library';
import { isTypeCallback, isTypeFunction } from '@ez4/reflection';

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
    return undefined;
  }

  if (type.parameters) {
    const [contextType] = type.parameters;

    const references = getFunctionReferences(contextType);

    if (references?.length) {
      handler.references = references;
    }
  }

  return handler;
};
