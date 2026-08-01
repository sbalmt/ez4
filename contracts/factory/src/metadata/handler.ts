import type { AllType, TypeCallback, TypeFunction } from '@ez4/reflection';

import { getFunctionSignature, getFunctionReferences } from '@ez4/common/library';
import { isTypeCallback, isTypeFunction } from '@ez4/reflection';

import { IncompleteHandlerError } from '../errors/handler';

export const isFactoryHandlerDeclaration = (type: AllType): type is TypeCallback | TypeFunction => {
  return isTypeCallback(type) || isTypeFunction(type);
};

export const getFactoryHandlerMetadata = (type: AllType, errorList: Error[]) => {
  if (!isFactoryHandlerDeclaration(type)) {
    return undefined;
  }

  const handler = getFunctionSignature(type);

  if (!handler) {
    errorList.push(new IncompleteHandlerError(type.file));
    return undefined;
  }

  if (type.parameters) {
    const [contextType] = type.parameters;

    if (contextType) {
      const references = getFunctionReferences(contextType);

      if (references?.length) {
        handler.references = references;
      }
    }
  }

  return handler;
};
