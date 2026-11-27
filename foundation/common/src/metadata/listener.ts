import type { AllType, TypeCallback, TypeFunction } from '@ez4/reflection';

import { isTypeCallback, isTypeFunction } from '@ez4/reflection';

import { getFunctionReferences, getFunctionSignature } from '../reflection/function';
import { IncompleteListenerError } from '../errors/listener';

export const isServiceListener = (type: AllType): type is TypeCallback | TypeFunction => {
  return isTypeCallback(type) || isTypeFunction(type);
};

export const getServiceListener = (type: AllType, errorList: Error[]) => {
  if (!isServiceListener(type)) {
    return undefined;
  }

  const listener = getFunctionSignature(type);

  if (!listener) {
    errorList.push(new IncompleteListenerError(type.file));
    return undefined;
  }

  if (type.parameters) {
    const [, contextType] = type.parameters;

    if (contextType) {
      const references = getFunctionReferences(contextType);

      if (references) {
        listener.references = references;
      }
    }
  }

  return listener;
};
