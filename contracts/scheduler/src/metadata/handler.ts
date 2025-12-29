import type { AllType, ReflectionTypes, TypeCallback, TypeFunction } from '@ez4/reflection';

import { isTypeCallback, isTypeFunction } from '@ez4/reflection';
import { getFunctionSignature } from '@ez4/common/library';

import { IncompleteHandlerError } from '../errors/handler';
import { getCronEventMetadata } from './event';

export const isTargetHandlerDeclaration = (type: AllType): type is TypeCallback | TypeFunction => {
  return isTypeCallback(type) || isTypeFunction(type);
};

export const getTargetHandlerMetadata = (type: AllType, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isTargetHandlerDeclaration(type)) {
    return undefined;
  }

  const handler = getFunctionSignature(type);
  const properties = new Set<string>();

  const request = type.parameters?.[0].value;

  if (request && !getCronEventMetadata(request, type, reflection, errorList)) {
    properties.add('request');
  }

  if (!handler || properties.size) {
    errorList.push(new IncompleteHandlerError([...properties], type.file));
    return undefined;
  }

  return handler;
};
