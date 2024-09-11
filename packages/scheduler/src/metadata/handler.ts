import type { Incomplete } from '@ez4/utils';
import type { AllType } from '@ez4/reflection';
import type { CronHandler } from '../types/handler.js';

import { IncompleteHandlerError } from '../errors/handler.js';
import { isCronHandler } from './utils.js';

export const getCronHandler = (type: AllType, errorList: Error[]) => {
  if (!isCronHandler(type)) {
    return null;
  }

  const handler: Incomplete<CronHandler> = {};
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

const isValidHandler = (type: Incomplete<CronHandler>): type is CronHandler => {
  return !!type.name && !!type.file;
};
