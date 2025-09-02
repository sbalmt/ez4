import type { Incomplete } from '@ez4/utils';
import type { AllType, SourceMap } from '@ez4/reflection';
import type { SubscriptionHandler } from '../types/common';

import { IncompleteHandlerError } from '../errors/handler';
import { isSubscriptionHandler } from './utils';
import { getQueueMessage } from './message';

export const getSubscriptionHandler = (type: AllType, reflection: SourceMap, errorList: Error[]) => {
  if (!isSubscriptionHandler(type)) {
    return null;
  }

  const { description, module } = type;

  const handler: Incomplete<SubscriptionHandler> = {
    ...(description && { description }),
    ...(module && { module })
  };

  const properties = new Set(['name', 'file', 'request']);

  if ((handler.name = type.name)) {
    properties.delete('name');
  }

  if ((handler.file = type.file)) {
    properties.delete('file');
  }

  const message = type.parameters?.[0].value;

  if (message && getQueueMessage(message, type, reflection, errorList)) {
    properties.delete('request');
  }

  if (properties.size === 0 && isValidHandler(handler)) {
    return handler;
  }

  errorList.push(new IncompleteHandlerError([...properties], type.file));

  return null;
};

const isValidHandler = (type: Incomplete<SubscriptionHandler>): type is SubscriptionHandler => {
  return !!type.name && !!type.file;
};
