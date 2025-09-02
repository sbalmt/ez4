import type { Incomplete } from '@ez4/utils';
import type { AllType, SourceMap } from '@ez4/reflection';
import type { EventHandler } from '../types/common';

import { IncompleteHandlerError } from '../errors/handler';
import { isEventHandler } from './utils';

export const getEventHandler = (type: AllType, _reflection: SourceMap, errorList: Error[]) => {
  if (!isEventHandler(type)) {
    return null;
  }

  const { description, module } = type;

  const handler: Incomplete<EventHandler> = {
    ...(description && { description }),
    ...(module && { module })
  };

  const properties = new Set(['name', 'file']);

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
