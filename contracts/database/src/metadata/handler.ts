import type { AllType, ReflectionTypes, TypeCallback, TypeFunction } from '@ez4/reflection';

import { isTypeCallback, isTypeFunction } from '@ez4/reflection';
import { getFunctionSignature } from '@ez4/common/library';

import { IncompleteHandlerError } from '../errors/handler';

export const isStreamHandlerDeclaration = (type: AllType): type is TypeCallback | TypeFunction => {
  return isTypeCallback(type) || isTypeFunction(type);
};

export const getStreamHandlerMetadata = (type: AllType, _reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isStreamHandlerDeclaration(type)) {
    return undefined;
  }

  const handler = getFunctionSignature(type);

  const properties = new Set(['change']);

  if (type.parameters) {
    properties.delete('change');
  }

  if (!handler || properties.size) {
    errorList.push(new IncompleteHandlerError([...properties], type.file));
    return undefined;
  }

  return handler;
};
