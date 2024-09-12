import type { Incomplete } from '@ez4/utils';
import type { AllType } from '@ez4/reflection';
import type { TargetHandler } from '../types/handler.js';

import { IncompleteHandlerError } from '../errors/handler.js';
import { isTargetHandler } from './utils.js';

export const getTargetHandler = (type: AllType, errorList: Error[]) => {
  if (!isTargetHandler(type)) {
    return null;
  }

  const handler: Incomplete<TargetHandler> = {};
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

const isValidHandler = (type: Incomplete<TargetHandler>): type is TargetHandler => {
  return !!type.name && !!type.file;
};
