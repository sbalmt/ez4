import type { AllType, ReflectionTypes, TypeCallback, TypeFunction } from '@ez4/reflection';

import { isTypeCallback, isTypeFunction } from '@ez4/reflection';
import { getFunctionSignature } from '@ez4/common/library';

import { IncompleteHandlerError } from '../errors/handler';
import { getTopicMessageMetadata } from './message';

export const isSubscriptionHandlerDeclaration = (type: AllType): type is TypeCallback | TypeFunction => {
  return isTypeCallback(type) || isTypeFunction(type);
};

export const getSubscriptionHandlerMetadata = (type: AllType, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isSubscriptionHandlerDeclaration(type)) {
    return undefined;
  }

  const handler = getFunctionSignature(type);

  const properties = new Set(['request']);

  const message = type.parameters?.[0].value;

  if (message && getTopicMessageMetadata(message, type, reflection, errorList)) {
    properties.delete('request');
  }

  if (!handler || properties.size) {
    errorList.push(new IncompleteHandlerError([...properties], type.file));
    return undefined;
  }

  return handler;
};
