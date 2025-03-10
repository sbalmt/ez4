import type { Incomplete } from '@ez4/utils';
import type { AllType, SourceMap } from '@ez4/reflection';
import type { EventHandler } from '../types/common.js';

import { IncompleteHandlerError } from '../errors/handler.js';
import { isEventHandler } from './utils.js';

export const getEventHandler = (type: AllType, _reflection: SourceMap, errorList: Error[]) => {
  if (!isEventHandler(type)) {
    return null;
  }

  const handler: Incomplete<EventHandler> = {};
  const properties = new Set(['name', 'file']);

  if (type.description) {
    handler.description = type.description;
  }

  if ((handler.name = type.name)) {
    properties.delete('name');
  }

  if ((handler.file = type.file)) {
    properties.delete('file');
  }

  if (properties.size === 0 && isValidHandler(handler)) {
    return handler;
  }

  errorList.push(new IncompleteHandlerError([...properties], type.file));

  return null;
};

const isValidHandler = (type: Incomplete<EventHandler>): type is EventHandler => {
  return !!type.name && !!type.file;
};
