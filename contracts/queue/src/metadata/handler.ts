import type { AllType, ReflectionTypes, TypeCallback, TypeFunction } from '@ez4/reflection';

import { getFunctionReferences, getFunctionSignature } from '@ez4/common/library';
import { isTypeCallback, isTypeFunction } from '@ez4/reflection';

import { IncompleteHandlerError } from '../errors/handler';
import { getQueueMessageMetadata } from './message';

export const isSubscriptionHandlerDeclaration = (type: AllType): type is TypeCallback | TypeFunction => {
  return isTypeCallback(type) || isTypeFunction(type);
};

export const getSubscriptionHandlerMetadata = (type: AllType, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isSubscriptionHandlerDeclaration(type)) {
    return undefined;
  }

  const handler = getFunctionSignature(type);

  const properties = new Set(['request']);

  if (type.parameters) {
    const [messageType, contextType] = type.parameters;

    if (messageType && getQueueMessageMetadata(messageType.value, type, reflection, errorList)) {
      properties.delete('request');
    }

    if (handler && contextType) {
      const references = getFunctionReferences(contextType);

      if (references?.length) {
        handler.references = references;
      }
    }
  }

  if (!handler || properties.size) {
    errorList.push(new IncompleteHandlerError([...properties], type.file));
    return undefined;
  }

  return handler;
};
