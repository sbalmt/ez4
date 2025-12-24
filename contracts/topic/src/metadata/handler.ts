import type { AllType, ReflectionTypes } from '@ez4/reflection';

import { getFunctionSignature } from '@ez4/common/library';

import { IncompleteHandlerError } from '../errors/handler';
import { isSubscriptionHandler } from './utils';
import { getTopicMessage } from './message';

export const getSubscriptionHandler = (type: AllType, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isSubscriptionHandler(type)) {
    return undefined;
  }

  const handler = getFunctionSignature(type);

  const properties = new Set(['request']);

  const message = type.parameters?.[0].value;

  if (message && getTopicMessage(message, type, reflection, errorList)) {
    properties.delete('request');
  }

  if (!handler || properties.size) {
    errorList.push(new IncompleteHandlerError([...properties], type.file));

    return undefined;
  }

  return handler;
};
