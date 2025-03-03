import type { Incomplete } from '@ez4/utils';
import type { AllType } from '@ez4/reflection';
import type { HttpHandler } from '../types/common.js';

import { IncompleteHandlerError } from '../errors/handler.js';
import { isHttpHandler } from './utils.js';

export const getHttpCatcher = (type: AllType, errorList: Error[]) => {
  if (!isHttpHandler(type)) {
    return null;
  }

  const handler: Incomplete<HttpHandler> = {};
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

  if (isValidHandler(handler)) {
    return handler;
  }

  errorList.push(new IncompleteHandlerError([...properties], type.file));

  return null;
};

const isValidHandler = (type: Incomplete<HttpHandler>): type is HttpHandler => {
  return !!type.name && !!type.file;
};
