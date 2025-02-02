import type { Incomplete } from '@ez4/utils';
import type { AllType, SourceMap } from '@ez4/reflection';
import type { SubscriptionHandler } from '../types/common.js';

import { IncompleteHandlerError } from '../errors/handler.js';
import { isSubscriptionHandler } from './utils.js';
import { getNotificationMessage } from './message.js';

export const getSubscriptionHandler = (
  type: AllType,
  reflection: SourceMap,
  errorList: Error[]
) => {
  if (!isSubscriptionHandler(type)) {
    return null;
  }

  const handler: Incomplete<SubscriptionHandler> = {};
  const properties = new Set(['name', 'file', 'request']);

  if (type.description) {
    handler.description = type.description;
  }

  if ((handler.name = type.name)) {
    properties.delete('name');
  }

  if ((handler.file = type.file)) {
    properties.delete('file');
  }

  if (
    type.parameters &&
    getNotificationMessage(type.parameters[0].value, type, reflection, errorList)
  ) {
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
