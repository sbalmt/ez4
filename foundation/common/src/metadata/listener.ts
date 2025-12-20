import type { AllType, TypeCallback, TypeFunction } from '@ez4/reflection';

import { isTypeCallback, isTypeFunction } from '@ez4/reflection';

import { getFunctionSignature } from '../reflection/function';
import { IncompleteListenerError } from '../errors/listener';

export const isServiceListener = (type: AllType): type is TypeCallback | TypeFunction => {
  return isTypeCallback(type) || isTypeFunction(type);
};

export const getServiceListener = (type: AllType, errorList: Error[]) => {
  if (!isServiceListener(type)) {
    return undefined;
  }

  const handler = getFunctionSignature(type);

  if (!handler) {
    errorList.push(new IncompleteListenerError(type.file));
  }

  return handler;
};
